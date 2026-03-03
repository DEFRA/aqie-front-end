import { createPollutantHandler } from '../common/helpers/pollutant-controller-helper.js'

const particulateMatter25Controller = {
  handler: (request, h) => {
    return createPollutantHandler('particulateMatter25', request, h)
  }
}

export { particulateMatter25Controller }
