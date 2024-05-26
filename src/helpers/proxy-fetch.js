import { config } from '~/src/config'
import { ProxyAgent, fetch as undiciFetch } from 'undici'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
const logger = createLogger()

const nonProxyFetch = (url, opts) => {
  return undiciFetch(url, {
    ...opts
  })
}

const proxyFetch = (url, opts) => {
  const proxy = config.get('httpsProxy') ?? config.get('httpProxy')
  if (!proxy) {
    logger.info('no proxy')
    return nonProxyFetch(url, opts)
  } else {
    logger.info(`proxy ${proxy}`)
    return undiciFetch(url, {
      ...opts,
      dispatcher: new ProxyAgent({
        uri: proxy,
        keepAliveTimeout: 10,
        keepAliveMaxTimeout: 10
      })
    })
  }
}

export { proxyFetch }
