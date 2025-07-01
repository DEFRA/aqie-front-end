const path = require('path')

const manifestPath = path.resolve(__dirname, '../dist/manifest.json')

try {
  const manifest = require(manifestPath)
  console.log('Loaded Manifest:', manifest)
} catch (error) {
  console.error('Manifest file not found:', error)
}
