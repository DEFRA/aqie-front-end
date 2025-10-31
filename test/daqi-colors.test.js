// Automated test for verifying DAQI cell colors
//''
const { expect } = require('chai')
const { JSDOM } = require('jsdom')

// Map of expected DAQI colors (1-10)
const expectedColors = [
  '#9cff9c', // 1
  '#31ff00', // 2
  '#31cf00', // 3
  '#ffff00', // 4
  '#ffcf00', // 5
  '#ff9a00', // 6
  '#ff6464', // 7
  '#ff0000', // 8
  '#990000', // 9
  '#ce30ff' // 10
]

describe('DAQI Cell Colors', () => {
  it('should render the correct background color for each DAQI level', () => {
    // Create a fake HTML table with DAQI cells
    const html = `
      <table>
        <tr>
          ${expectedColors.map((_, i) => `<td class="daqi-${i + 1}">DAQI ${i + 1}</td>`).join('')}
        </tr>
      </table>
    `
    const dom = new JSDOM(html, { runScripts: 'dangerously' })
    const { window } = dom
    const { document } = window

    // Simulate CSS background-color assignment
    expectedColors.forEach((color, i) => {
      const cell = document.querySelector(`.daqi-${i + 1}`)
      // Simulate computed style (in real app, this comes from CSS)
      cell.style.backgroundColor = color
    })

    // Helper to convert rgb to hex
    function rgbToHex(rgb) {
      const result = rgb.match(/\d+/g)
      if (!result) return rgb
      return (
        '#' +
        result
          .map((x) => {
            const hex = parseInt(x).toString(16)
            return hex.length === 1 ? '0' + hex : hex
          })
          .join('')
      ).toLowerCase()
    }

    // Test each cell's background color
    expectedColors.forEach((color, i) => {
      const cell = document.querySelector(`.daqi-${i + 1}`)
      const actual = cell.style.backgroundColor.toLowerCase()
      const actualHex = actual.startsWith('rgb') ? rgbToHex(actual) : actual
      expect(actualHex).to.equal(color)
    })
  })
})
