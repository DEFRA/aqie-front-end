import { createPollutantHandler } from '../common/helpers/pollutant-controller-helper.js'

const sulphurDioxideController = {
  handler: (request, h) => createPollutantHandler('sulphurDioxide', request, h)
}

export { sulphurDioxideController }
