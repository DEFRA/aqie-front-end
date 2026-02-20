import inert from '@hapi/inert'
import { home } from './home/index.js'
import { homeCy } from './home/cy/index.js'
import { searchLocation } from './search-location/index.js'
import { searchLocationCy } from './search-location/cy/index.js'
import { retry } from './retry/index.js'
import { loading } from './loading/index.js'
import { locations } from './locations/index.js'
import { locationsCy } from './locations/cy/index.js'
import { locationId } from './location-id/index.js'
import { locationIdCy } from './location-id/cy/index.js'
import { serveStaticFiles } from './common/helpers/serve-static-files.js'
import { nitrogenDioxide } from './nitrogen-dioxide/index.js'
import { nitrogenDioxideCy } from './nitrogen-dioxide/cy/index.js'
import { ozone } from './ozone/index.js'
import { ozoneCy } from './ozone/cy/index.js'
import { particulateMatter10 } from './particulate-matter-10/index.js'
import { particulateMatter10Cy } from './particulate-matter-10/cy/index.js'
import { particulateMatter25 } from './particulate-matter-25/index.js'
import { particulateMatter25Cy } from './particulate-matter-25/cy/index.js'
import { sulphurDioxide } from './sulphur-dioxide/index.js'
import { sulphurDioxideCy } from './sulphur-dioxide/cy/index.js'
import { privacy } from './privacy/index.js'
import { privacyCy } from './privacy/cy/index.js'
import { cookies } from './cookies/index.js'
import { cookiesCy } from './cookies/cy/index.js'
import { accessibility } from './accessibility/index.js'
import { accessibilityCy } from './accessibility/cy/index.js'
import { health } from './health/index.js'
import { multipleResults } from './multiple-results/index.js'
import { multipleResultsCy } from './multiple-results/cy/index.js'
import { locationNotFound } from './location-not-found/index.js'
import { testRoutes } from './test-routes/index.js'
import { actionsReduceExposure } from './actions-reduce-exposure/index.js'
import { actionsReduceExposureCy } from './actions-reduce-exposure/cy/index.js'
import { notify } from './notify/register/sms-mobile-number/index.js'
import { sendActivation } from './notify/register/sms-send-activation/index.js'
import { checkMessage } from './notify/register/sms-verify-code/index.js'
import { sendNewCode } from './notify/register/sms-send-new-code/index.js'
import { confirmAlertDetails } from './notify/register/sms-confirm-details/index.js'
import { alertsSuccess } from './notify/register/sms-success/index.js'
import { checkMaxAlerts } from './notify/register/check-max-alerts/index.js'
import { smsDuplicate } from './notify/register/sms-duplicate/index.js'
import { emailDuplicate } from './notify/register/email-duplicate/index.js'
import { alertsSuccess as emailAlertsSuccess } from './notify/register/alerts-success/index.js'
import { confirmAlertDetails as genericConfirmAlertDetails } from './notify/register/confirm-alert-details/index.js'
import { emailDetails } from './notify/register/email-details/index.js'
import { emailSendActivation } from './notify/register/email-send-activation/index.js'
import { emailVerifyEmail } from './notify/register/email-verify-email/index.js'
import { emailConfirmLink } from './notify/register/email-confirm-link/index.js'
import notifyDebugClearMockStorage from './notify/debug/clear-mock-storage.js'
import path from 'node:path'
import { createLogger } from './common/helpers/logging/logger.js'
import { SERVER_DIRNAME } from './data/constants.js'
import { healthEffects } from './health-effects/index.js'
import { healthEffectsCy } from './health-effects/cy/index.js'

const logger = createLogger() // ''

/**
 * Get all plugins to register
 */
const getAllPlugins = () => [
  home,
  homeCy,
  searchLocation,
  searchLocationCy,
  retry,
  loading,
  locations,
  locationsCy,
  locationId,
  locationIdCy,
  serveStaticFiles,
  nitrogenDioxide,
  nitrogenDioxideCy,
  ozone,
  ozoneCy,
  particulateMatter10,
  particulateMatter10Cy,
  particulateMatter25,
  particulateMatter25Cy,
  sulphurDioxide,
  sulphurDioxideCy,
  privacy,
  privacyCy,
  cookies,
  cookiesCy,
  accessibility,
  accessibilityCy,
  multipleResults,
  multipleResultsCy,
  locationNotFound,
  health,
  testRoutes,
  actionsReduceExposure, // ''
  actionsReduceExposureCy, // ''
  healthEffects, // ''
  healthEffectsCy, // ''
  notify,
  sendActivation,
  checkMessage,
  sendNewCode,
  confirmAlertDetails,
  alertsSuccess,
  checkMaxAlerts,
  smsDuplicate,
  emailDuplicate,
  genericConfirmAlertDetails,
  emailAlertsSuccess,
  emailDetails,
  emailSendActivation,
  emailVerifyEmail,
  emailConfirmLink,
  notifyDebugClearMockStorage
]

/**
 * Register all application plugins
 */
const registerPlugins = async (server) => {
  const plugins = getAllPlugins()

  for (const plugin of plugins) {
    const pluginName = plugin.name || plugin.plugin?.name || 'CustomPluginName' // ''
    logger.info(`Registering plugin 2: ${pluginName}`) // ''
    await server.register(plugin) // ''
  }
}

/**
 * Setup static file routes
 */
const setupStaticRoutes = (server) => {
  server.route({
    method: 'GET',
    path: '/.well-known/{param*}',
    handler: {
      directory: {
        path: path.resolve(SERVER_DIRNAME, '../../.public/.well-known'),
        redirectToSlash: true,
        index: true
      }
    }
  }) // ''

  const existingRoutes = server.table().map((route) => route.path) // ''

  if (existingRoutes.includes('/public/{param*}')) {
    logger.warn('Route /public/{param*} already exists. Skipping registration.') // ''
  } else {
    server.route({
      method: 'GET',
      path: '/public/{param*}',
      handler: {
        directory: {
          // ''
          path: path.resolve(SERVER_DIRNAME, '../../.public'),
          redirectToSlash: true,
          index: true
        }
      }
    }) // ''
  }
}

const router = {
  plugin: {
    name: 'router',
    register: async (server) => {
      await server.register([inert]) // ''
      await registerPlugins(server)
      setupStaticRoutes(server)
    }
  }
}

export { router } // ''
