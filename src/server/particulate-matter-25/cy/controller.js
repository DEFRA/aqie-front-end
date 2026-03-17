import { createWelshPollutantController } from '../../common/helpers/cy/pollutant-controller-helper.js'

const particulateMatter25Controller = createWelshPollutantController({
  pollutantKey: 'particulateMatter25',
  englishPath: '/pollutants/particulate-matter-25',
  viewTemplate: 'particulate-matter-25/index',
  welshPathKey: 'mater-gronynnol-25',
  pageIdentifier: 'particulate matter 25'
})

export { particulateMatter25Controller }
