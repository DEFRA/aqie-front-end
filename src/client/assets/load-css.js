import { createLogger } from '../../server/common/helpers/logging/logger'

// Dynamically load the correct CSS file based on Webpack's assets-manifest.json
const logger = createLogger('load-css')

fetch('/public/assets-manifest.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Failed to load assets-manifest.json')
    }
    return response.json()
  })
  .then((manifest) => {
    const cssFile = manifest['stylesheets/application.css']
    if (cssFile) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `/public/${cssFile}`
      document.head.appendChild(link)
    } else {
      logger.error('CSS file not found in manifest')
    }
  })
  .catch((error) => {
    logger.error('Error loading CSS file:', error)
  })
