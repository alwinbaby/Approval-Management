'use strict'

const $ = window.$
let select

$(document).ready(function () {
  // Set application form to 60% opacity while software loads
  $('#application').css('opacity', '0.6')

  // Pull software from API and populate select field
  loadSoftware(data => {
    select = $('#software-select').selectize({
      maxItems: 1,
      create: false,
      valueField: 'id',
      labelField: 'name',
      searchField: 'name',
      sortField: [
        {
          field: 'name',
          direction: 'asc'
        }
      ],
      options: data
    })

    // Hide spinner and reset app form to 100% opacity
    $('#application-spinner').hide()
    $('#application').css('opacity', 1)
  })

  // Bind onClick events
  $('#submit').on('click', function () {
    // Clear errors
    $('#reason').removeClass('is-invalid')
    $('#reasonError').hide()
    $('#softwareError').hide()

    if (select[0].value === '') {
      $('#softwareError').show()
      return
    }

    if ($('#reason').val() === '') {
      $('#reason').addClass('is-invalid')
      $('#reasonError').show()
    }

    // var softwareId = select[0].value
    // var reason = $('#reason').val()
    // submit(softwareId, reason)
  })

  $('#clear').on('click', function () {
    clear()
  })
})

function loadSoftware (callback) {
  // jQuery ajax call to nodeJs api endpoint
  $.get('/api/software', function (data) {
    callback(data)
  })
}

// Clear the form inputs
function clear () {
  select[0].selectize.clear()
  $('#reason').val('')
}
