const express = require('express')
const passport = require('passport')
const User = require('../models').User
const router = express.Router()

router.get('/login', (req, res, next) => {
  res.render('login', {
    hideNav: true,
    message: req.flash('loginMessage')
  })
})

router.get('/register', (req, res, next) => {
  res.render('register', {
    hideNav: true,
    message: req.flash('registerMessage')
  })
})

router.get('/logout', (req, res, next) => {
  req.logout()
  res.redirect('/login')
})

router.post('/signup', (req, res, next) => {
  User.find({ where: { email: req.body.email } })
    .then(function (user) {
      if (!user) {
        let newUser = {}
        newUser.first_name = req.body.firstName
        newUser.last_name = req.body.lastName
        newUser.email = req.body.email
        newUser.password = User.generateHash(req.body.password)
        newUser.type = 'user'
        User.create(newUser)
          .then(function (user) {
            passport.authenticate('local')(req, res, function () {
              res.redirect('/')
            })
          })
      } else {
        req.flash('registerMessage', 'User already exists with that email.')
        res.redirect('/register')
      }
    })
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

router.get('/profile', isLoggedIn, function (req, res) {
  res.send(req.user)
})

module.exports = router

function isLoggedIn (req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) { return next() }

  // if they aren't redirect them to the home page
  res.redirect('/login')
}
