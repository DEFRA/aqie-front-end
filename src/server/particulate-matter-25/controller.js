import { createPollutantHandler } from '../common/helpers/pollutant-controller-helper.js'

const particulateMatter25Controller = {
  handler: (request, h) =>
    createPollutantHandler('particulateMatter25', request, h)
}

export { particulateMatter25Controller }
