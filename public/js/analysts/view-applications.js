'use strict'

const $ = window.$
const moment = window.moment
let applications

$(document).ready(function () {
  // Set application form to 60% opacity while software loads
  $('#applications').css('opacity', '0.6')

  // Pull software from API and populate select field
  loadApplications(data => {
    console.log(data)
    // Hide spinner and reset app form to 100% opacity
    $('#loading-spinner').hide()
    $('#applications').css('opacity', 1)

    applications = data
    $.each(data, function (i, item) {
      var appendTo = '#software_table_body'
      if (item.status !== 'Approved') {
        appendTo = '#past_software_table_body'
      }
      $('<tr onclick="showModal(' + item.id + ')">').append(
        $('<td>').text(item.id),
        $('<td>').text(item.User.first_name + ' ' + item.User.last_name),
        $('<td>').text(item.Software.name),
        $('<td>').text(item.Approver ? item.Approver.first_name + ' ' + item.Approver.last_name : null),
        $('<td>').text(item.status),
        $('<td>').text(moment(item.createdAt).format('MMM Do, YYYY, h:mm a'))
      ).appendTo(appendTo)
    })
    $('#software_table').DataTable({
      lengthChange: false
    })
    $('#past_software_table').DataTable({
      lengthChange: false
    })
  })
})

function showModal (applicationId) {
  const app = applications.filter(a => a.id === applicationId)[0]
  $('#applicationModal').modal({
    size: 'lg'
  })
  $('#modal_applicationId').text(app.id)
  $('#modal_software').text(app.Software.name)
  $('#modal_approver').text(app.Approver ? app.Approver.first_name + ' ' + app.Approver.last_name : 'N/A')
  $('#modal_reason').text(app.reason)
  $('#modal_status').text(app.status)
  $('#reject_applicationId').val(app.id)
  $('#grant_applicationId').val(app.id)
}

function loadApplications (callback) {
  $.get('/api/applications', function (data) {
    callback(data)
  })
}
