var express = require('express')
var router = express.Router()
var nodemailer = require('nodemailer')

// create reusable transport method (opens pool of SMTP connections)
const mailTransport = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '51b6e82a1d782c',
    pass: '90533a490177e3'
  }
})

const models = require('../models')

router.get('/software', isLoggedIn, function (req, res, next) {
  models.Software.findAll({
    include: [models.Approvers]
  }).then(software => {
    software.map(soft => soft.toJSON())
    res.send(software)
  })
})

router.get('/approvers', isLoggedIn, function (req, res, next) {
  models.Approvers.findAll({
    include: [models.Software]
  }).then(approvers => {
    approvers.map(app => app.toJSON())
    res.send(approvers)
  })
})

router.get('/applications', isLoggedIn, function (req, res, next) {
  if (req.user.type === 'user') {
    findUserApplications(req.user, applications => {
      res.send(applications)
    })
  }
  if (req.user.type === 'approver') {
    findApproverApplications(req.user, applications => {
      res.send(applications)
    })
  }
  if (req.user.type === 'analyst') {
    findAnalystApplications(req.user, applications => {
      res.send(applications)
    })
  }
})

function findUserApplications (user, callback) {
  models.Applications.findAll({
    where: { user_id: user.id },
    include: [models.Software, models.Approvers]
  })
    .then(applications => {
      applications.map(app => app.toJSON())
      callback(applications)
    })
}

function findApproverApplications (user, callback) {
  models.Approvers.findOne({
    where: { first_name: user.first_name, last_name: user.last_name },
    include: [models.Software]
  })
    .then(approver => {
      if (approver == null) {
        callback(null)
        return
      }

      const softwareIds = approver.Software.map(soft => soft.toJSON().id)

      models.Applications.findAll({
        where: { software_id: softwareIds },
        include: [models.User, models.Software]
      })
        .then(applications => {
          applications.map(app => app.toJSON())
          callback(applications)
        })
    })
}

function findAnalystApplications (user, callback) {
  models.Applications.findAll({
    include: [models.User, models.Software, models.Approvers]
  })
    .then(applications => {
      applications.map(app => app.toJSON())
      callback(applications)
    })
}

router.post('/applications', isLoggedIn, (req, res, next) => {
  let newApp = {}
  newApp.software_id = req.body.softwareId
  newApp.reason = req.body.reason
  newApp.user_id = req.user.id
  newApp.status = 'Pending Approval'
  models.Applications.create(newApp)
    .then(function (app) {
      req.flash('alertType', 'success')
      req.flash('alertMessage', 'New software application submitted successfully.')
      res.redirect('/view-applications')
    })
})

router.post('/applications/delete', isLoggedIn, (req, res, next) => {
  const id = req.body.applicationId
  const userId = req.user.id
  models.Applications.destroy({ where: { id: id, user_id: userId } })
    .then((application) => {
      req.flash('alertType', 'success')
      req.flash('alertMessage', 'Application deleted successfully.')
      res.redirect('/view-applications')
    })
})

router.post('/applications/approve', isLoggedIn, (req, res, next) => {
  const id = req.body.applicationId
  models.Applications.findOne({
    where: { id: id },
    include: [models.User, models.Software]
  })
    .then(application => {
      models.Approvers.findOne({ where: { first_name: req.user.first_name, last_name: req.user.last_name } })
        .then(approver => {
          application.status = 'Approved'
          application.approver_id = approver.id
          application.save().then(() => {
            req.flash('alertType', 'success')
            req.flash('alertMessage', 'Application approved.')
            res.redirect('/view-applications')

            notifyAnalysts(application.User, application.Software)
          })
        })
    })
})

function notifyAnalysts (user, software) {
  models.User.findAll({ where: { type: 'analyst' } })
    .then(analysts => {
      analysts.forEach(analyst => {
        sendMail(analyst.email, 'New Application', `A new approved application for ${user.first_name} ${user.last_name} - ${software.name} has been added.`)
      })
    })
}

router.post('/applications/grant', isLoggedIn, (req, res, next) => {
  const id = req.body.applicationId
  models.Applications.findOne({
    where: { id: id },
    include: [models.User, models.Software]
  })
    .then(application => {
      application.status = 'Access Granted'
      application.analyst_id = req.user.id

      sendMail(application.User.email, 'Application Approved', `Your application for access to ${application.Software.name} has been granted!`)

      application.save().then(() => {
        req.flash('alertType', 'success')
        req.flash('alertMessage', 'Application access granted.')
        res.redirect('/view-applications')
      })
    })
})

router.post('/applications/analyst/reject', isLoggedIn, (req, res, next) => {
  const id = req.body.applicationId
  models.Applications.findOne({
    where: { id: id },
    include: [models.User, models.Software]
  })
    .then(application => {
      application.status = 'Rejected'
      application.analyst_id = req.user.id

      sendMail(application.User.email, 'Application Rejected', `Your application for access to ${application.Software.name} has been rejected.`)

      application.save().then(() => {
        req.flash('alertType', 'danger')
        req.flash('alertMessage', 'Application rejected.')
        res.redirect('/view-applications')
      })
    })
})

router.post('/applications/approver/reject', isLoggedIn, (req, res, next) => {
  const id = req.body.applicationId
  models.Applications.findOne({
    where: { id: id },
    include: [models.User, models.Software]
  })
    .then(application => {
      models.Approvers.findOne({ where: { first_name: req.user.first_name, last_name: req.user.last_name } })
        .then(approver => {
          application.status = 'Rejected'
          application.approver_id = approver.id

          sendMail(application.User.email, 'Application Rejected', `Your application for access to ${application.Software.name} has been rejected.`)

          application.save().then(() => {
            req.flash('alertType', 'danger')
            req.flash('alertMessage', 'Application rejected.')
            res.redirect('/view-applications')
          })
        })
    })
})

module.exports = router

function isLoggedIn (req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) { return next() }

  // if they aren't redirect them to the home page
  res.redirect('/login')
}

function sendMail (to, subject, body) {
  const mailOptions = {
    from: 'HELL Management <management@hell.com', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: body // plaintext body
  }

  mailTransport.sendMail(mailOptions, null)
}
