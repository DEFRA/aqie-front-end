''(
  // daqi-colors-visual-tester.js
  // Script to visually cycle through all DAQI cell colors in the browser console
  // Usage: Run this script in the browser console on a page with DAQI cells

  function cycleDaqiCellColors() {
    // Helper: get all DAQI cell elements (update selector as needed)
    const daqiCells = document.querySelectorAll('.daqi-cell')
    if (!daqiCells.length) {
      console.warn('No DAQI cells found.')
      return
    }

    // List of colors to test (update as needed)
    const colors = [
      '#00e400', // Good
      '#ffff00', // Moderate
      '#ff7e00', // Unhealthy for Sensitive Groups
      '#ff0000', // Unhealthy
      '#8f3f97', // Very Unhealthy
      '#7e0023' // Hazardous
      // Add more if needed
    ]

    let idx = 0
    function nextColor() {
      const color = colors[idx % colors.length]
      daqiCells.forEach((cell) => {
        cell.style.transition = 'background 0.3s'
        cell.style.background = color
      })
      console.log(`DAQI cells set to color: ${color}`)
      idx++
      if (idx < colors.length) {
        setTimeout(nextColor, 800) // Change color every 800ms
      } else {
        setTimeout(() => {
          daqiCells.forEach((cell) => (cell.style.background = ''))
          console.log('DAQI cell color test complete.')
        }, 1000)
      }
    }
    nextColor()
  }
)()
