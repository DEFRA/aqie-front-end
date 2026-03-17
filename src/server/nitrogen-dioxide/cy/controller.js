import { createWelshPollutantController } from '../../common/helpers/cy/pollutant-controller-helper.js'

const nitrogenDioxideController = createWelshPollutantController({
  pollutantKey: 'nitrogenDioxide',
  englishPath: '/pollutants/nitrogen-dioxide',
  viewTemplate: 'nitrogen-dioxide/index',
  welshPathKey: 'nitrogen-deuocsid',
  pageIdentifier: 'Nitrogen dioxide (NO₂)',
  auditLogMessage:
    'AuditLog17-WELSH Pollutant Info Viewed - Nitrogen Dioxide (NO2) (CY)'
})

export { nitrogenDioxideController }
