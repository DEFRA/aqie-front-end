/* eslint-disable no-console */
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
  logger.info(`::::::::::::: fetchOAuthToken proxy  :::::::::::::::: ${proxy}`)
  if (!proxy) {
    return nonProxyFetch(url, opts)
  } else {
    logger.info(
      `::::::::::::: fetchOAuthToken proxy  :::::::::::::::: ${proxy}`
    )
    logger.info(
      `::::::::::::: fetchOAuthToken proxy url  :::::::::::::::: ${url}`
    )
    return undiciFetch(url, {
      ...opts,
      dispatcher: new ProxyAgent({
        uri: proxy,
        keepAliveTimeout: 100,
        keepAliveMaxTimeout: 100
      })
    })
  }
}

export { proxyFetch }
