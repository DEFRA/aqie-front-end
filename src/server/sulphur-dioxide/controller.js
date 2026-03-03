import { createPollutantHandler } from '../common/helpers/pollutant-controller-helper.js'

const sulphurDioxideController = {
  handler: (request, h) => {
    return createPollutantHandler('sulphurDioxide', request, h)
  }
}

export { sulphurDioxideController }
