import { config } from '../config'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { Url } from 'node:url'
import { createLogger } from '../server/common/helpers/logging/logger.js' // Updated import to use relative path

const logger = createLogger()

const proxyAgent = () => {
  const httpsProxy = config.get('httpsProxy')

  if (httpsProxy) {
    try {
      const proxyUrl = new Url(httpsProxy)
      return {
        url: proxyUrl,
        agent: new HttpsProxyAgent(proxyUrl)
      }
    } catch (error) {
      logger.error('Invalid proxy URL:', error)
      return null
    }
  }

  return null
}

export { proxyAgent }
