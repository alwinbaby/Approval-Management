const LocalStrategy = require('passport-local').Strategy
const User = require('../models').User

// expose this function to our app using module.exports
module.exports = function (passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    User.find({ where: id }).then(function (user) {
      done(null, user)
    })
  })

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req, email, password, done) {
    User.find({ where: { email: email } })
      .then(function (user) {
        if (!user || !User.validPassword(password, user.password)) {
          return done(null, false, req.flash('loginMessage', 'Invalid email or password.'))
        }
        return done(null, user)
      })
  }))
}
