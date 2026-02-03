import { config } from '../../config'
import { ProxyAgent, fetch as undiciFetch } from 'undici'

const nonProxyFetch = (url, opts) => {
  return undiciFetch(url, {
    ...opts
  })
}

const proxyFetch = (url, opts) => {
  const httpsProxy = config.get('httpsProxy')
  if (httpsProxy) {
    return undiciFetch(url, {
      ...opts,
      dispatcher: new ProxyAgent({
        uri: httpsProxy,
        keepAliveTimeout: 10,
        keepAliveMaxTimeout: 10
      })
    })
  } else {
    return nonProxyFetch(url, opts)
  }
}

export { proxyFetch }
