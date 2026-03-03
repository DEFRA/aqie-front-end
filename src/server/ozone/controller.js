import { createPollutantHandler } from '../common/helpers/pollutant-controller-helper.js'

const ozoneController = {
  handler: (request, h) => {
    return createPollutantHandler('ozone', request, h)
  }
}

export { ozoneController }
