import { config } from '~/src/config'
import { buildNavigation } from '~/src/config/nunjucks/context/build-navigation'

const appPathPrefix = config.get('appPathPrefix')
const mockRequest = ({ path = '' } = {}) => ({
  path
})

describe('#buildNavigation', () => {
  test('Should provide expected navigation details', async () => {
    expect(await buildNavigation(mockRequest())).toEqual([
      {
        isActive: false,
        text: 'Home',
        url: appPathPrefix
      }
    ])
  })
  test('Should provide expected highlighted navigation details', async () => {
    expect(await buildNavigation(mockRequest({ path: appPathPrefix }))).toEqual(
      [
        {
          isActive: true,
          text: 'Home',
          url: appPathPrefix
        }
      ]
    )
  })
})
