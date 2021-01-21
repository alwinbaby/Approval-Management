const express = require('express')
const router = express.Router()

router.get('/', isLoggedIn, (req, res, next) => {
  let pageName = 'login'
  if (req.user.type === 'user') {
    pageName = 'users/home'
  }
  if (req.user.type === 'approver') {
    pageName = 'approvers/home'
  }
  if (req.user.type === 'analyst') {
    pageName = 'analysts/home'
  }
  res.render(pageName, {
    page: 'home'
  })
})

router.get('/profile', isLoggedIn, (req, res, next) => {
  res.render('profile', {
    page: 'profile',
    user: req.user
  })
})

router.get('/create-application', isLoggedIn, (req, res, next) => {
  res.render('users/create-application', {
    page: 'create-application'
  })
})

router.get('/view-applications', isLoggedIn, (req, res, next) => {
  let pageName = ''
  if (req.user.type === 'user') {
    pageName = 'users/view-applications'
  } else if (req.user.type === 'approver') {
    pageName = 'approvers/view-applications'
  } else if (req.user.type === 'analyst') {
    pageName = 'analysts/view-applications'
  }
  let alert = null
  const message = req.flash('alertMessage')
  if (message.length > 0) {
    alert = {
      type: req.flash('alertType'),
      message: message
    }
  }
  res.render(pageName, {
    alert: alert,
    page: 'view-applications'
  })
})

function isLoggedIn (req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    res.locals.user = req.user
    return next()
  }

  // if they aren't redirect them to the home page
  res.redirect('/login')
}

module.exports = router
