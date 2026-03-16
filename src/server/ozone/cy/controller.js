import { createWelshPollutantController } from '../../common/helpers/cy/pollutant-controller-helper.js'

const ozoneController = createWelshPollutantController({
  pollutantKey: 'ozone',
  englishPath: '/pollutants/ozone',
  viewTemplate: 'ozone/index',
  welshPathKey: 'oson',
  pageIdentifier: 'ozone-cy',
  auditLogMessage: 'AuditLog19-WELSH Pollutant Info Viewed - Ozone (O3) (CY)'
})

export { ozoneController }
