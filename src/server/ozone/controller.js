import { createPollutantHandler } from '../common/helpers/pollutant-controller-helper.js'

const ozoneController = {
  handler: (request, h) => createPollutantHandler('ozone', request, h)
}

export { ozoneController }
