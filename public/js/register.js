'use strict'

const $ = window.$

$(document).ready(function () {
  $('#signupForm').submit(function (e) {
    var password = $('#passwordInput').val()
    var passwordVerify = $('#passwordVerifyInput').val()
    if (password !== passwordVerify) {
      $('#passwordMatch').show()
      $('#passwordVerifyInput').addClass('is-invalid')
      e.preventDefault()
      return false
    }
  })
})
