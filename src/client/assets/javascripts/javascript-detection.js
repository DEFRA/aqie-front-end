// ''
// Simple JavaScript detection - AJAX approach
// Default: JavaScript DISABLED, this script sets it to ENABLED
;(function () {
  'use strict'

  // Mark that this script has loaded
  window.jsDetectionLoaded = true
  window.jsDetectionTimestamp = new Date().toISOString()

  console.log('=== SIMPLE JS DETECTION (AJAX APPROACH) ===')
  console.log('✅ JavaScript is ENABLED (this script is running)')
  console.log('📡 Sending AJAX call to signal JavaScript enablement...')

  // Send a simple POST request to signal JavaScript is enabled
  fetch('/api/js-enabled', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    credentials: 'same-origin'
  })
    .then(function (response) {
      console.log(
        '✅ JavaScript enablement signal sent! Status:',
        response.status
      )
      return response.json()
    })
    .then(function (data) {
      console.log('📩 Server response:', data)
      console.log('🎉 JavaScript detection completed successfully!')
      window.jsDetectionCompleted = true
    })
    .catch(function (error) {
      console.log('❌ JavaScript enablement signal failed:', error)
      console.log('� Error details:', error.message)
      window.jsDetectionFailed = true
    })

  console.log('==========================================')
})()
