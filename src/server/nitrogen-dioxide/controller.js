import { createPollutantHandler } from '../common/helpers/pollutant-controller-helper.js'

const nitrogenDioxideController = {
  handler: (request, h) => createPollutantHandler('nitrogenDioxide', request, h)
}

export { nitrogenDioxideController }
