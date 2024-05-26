/* eslint-disable no-console */
import { config } from '~/src/config'
import { ProxyAgent, fetch as undiciFetch } from 'undici'

const nonProxyFetch = (url, opts) => {
  return undiciFetch(url, {
    ...opts
  })
}

const proxyFetch = (url, opts) => {
  const proxy = config.get('httpsProxy') ?? config.get('httpProxy')
  if (!proxy) {
    console.log('no proxy')
    return nonProxyFetch(url, opts)
  } else {
    console.log(`proxy ${proxy}`)
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
