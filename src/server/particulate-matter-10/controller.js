import { createPollutantHandler } from '../common/helpers/pollutant-controller-helper.js'

const particulateMatter10Controller = {
  handler: (request, h) =>
    createPollutantHandler('particulateMatter10', request, h)
}

export { particulateMatter10Controller }
