import { config } from '~/src/config'

const appPathPrefix = config.get('appPathPrefix')

function buildNavigation(request) {
  return [
    {
      text: 'Home',
      url: appPathPrefix,
      isActive: request.path === appPathPrefix
    }
  ]
}

export { buildNavigation }
