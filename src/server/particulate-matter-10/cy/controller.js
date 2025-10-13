import { createWelshPollutantController } from '../../common/helpers/cy/pollutant-controller-helper.js'

const particulateMatter10Controller = createWelshPollutantController({
  pollutantKey: 'particulateMatter10',
  englishPath: '/pollutants/particulate-matter-10',
  viewTemplate: 'particulate-matter-10/index',
  welshPathKey: 'mater-gronynnol-10',
  pageIdentifier: 'particulate matter 10'
})

export { particulateMatter10Controller }
