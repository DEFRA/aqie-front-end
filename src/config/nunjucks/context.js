import path from 'path'
import { config } from '../index.js'
import { createLogger } from '../../server/common/helpers/logging/logger.js'
import { readFileSync } from 'fs'

const logger = createLogger()
const assetPath = config.get('assetPath')
const manifestPath = path.resolve(config.get('root'), 'dist', 'manifest.json')
let webpackManifest

try {
  const manifestContent = readFileSync(manifestPath, 'utf-8')
  webpackManifest = JSON.parse(manifestContent)
} catch (error) {
  logger.error('Webpack Manifest assets file not found', error)
}

function buildNavigation(request) {
  return [
    {
      text: 'Home',
      url: '/',
      isActive: request.path === '/'
    }
  ]
}

function context(request) {
  return {
    serviceName: config.get('serviceName'),
    serviceUrl: '/',
    breadcrumbs: [],
    navigation: buildNavigation(request),
    getAssetPath(asset) {
      const webpackAssetPath = webpackManifest?.[asset]
      return `${assetPath}/${webpackAssetPath ?? asset}`
    }
  }
}

export { context }
