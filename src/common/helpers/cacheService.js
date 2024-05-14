/* eslint-disable prettier/prettier */
import hoek from 'hoek'
import CatboxRedis from '@hapi/catbox-redis'
import CatboxMemory from '@hapi/catbox-memory'
import IoRedis from 'ioredis'

import { config } from '~/src/config'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
// import { HapiRequest, HapiServer } from "../types";
// import { Request, ResponseToolkit, Server, ResponseObject } from "@hapi/hapi";
// import { FormSubmissionState } from "../plugins/engine/types";

const partition = 'cache'
const logger = createLogger()
const db = 0

let ADDITIONAL_IDENTIFIER
;(function (ADDITIONAL_IDENTIFIER) {
  ADDITIONAL_IDENTIFIER.Confirmation = ':confirmation'
})(ADDITIONAL_IDENTIFIER || (ADDITIONAL_IDENTIFIER = {}))

export class CacheService {
  /**
   * This service is responsible for getting, storing or deleting a user's session data in the cache. This service has been registered by {@link createServer}
   */
  cache
  logger

  constructor(server) {
    this.cache = server.cache({ segment: 'cache' })
    this.logger = server.logger
  }

  async getState(request) {
    const cached = await this.cache.get(this.Key(request))
    return cached || {}
  }

  async mergeState(request, value, nullOverride = true, arrayMerge = false) {
    const key = this.Key(request)

    const state = await this.getState(request)
    hoek.merge(state, value, nullOverride, arrayMerge)
    await this.cache.set(key, state, config.get('sessionTimeout'))
    return this.cache.get(key)
  }

  async getConfirmationState(request) {
    const key = this.Key(request, ADDITIONAL_IDENTIFIER.Confirmation)
    return await this.cache.get(key)
  }

  async setConfirmationState(request, viewModel) {
    const key = this.Key(request, ADDITIONAL_IDENTIFIER.Confirmation)
    return this.cache.set(key, viewModel, config.get('sessionTimeout'))
  }

  async clearState(request) {
    if (request.yar?.id) {
      this.cache.drop(this.Key(request))
    }
  }

  /**
   * The key used to store user session data against.
   * If there are multiple forms on the same runner instance, for example `form-a` and `form-a-feedback` this will prevent CacheService from clearing data from `form-a` if a user gave feedback before they finished `form-a`
   *
   * @param request - hapi request object
   * @param additionalIdentifier - appended to the id
   */
  Key(request, additionalIdentifier) {
    if (!request?.yar?.id) {
      throw Error('No session ID found')
    }
    return {
      segment: partition,
      id: `${request.yar.id}:${request.params.id}${additionalIdentifier}`
    }
  }
}

export const catboxProvider = () => {
  /**
   * If redisHost doesn't exist, CatboxMemory will be used instead.
   * More information at {@link https://hapi.dev/module/catbox/api}
   */
  const redisHost = config.get('redisHost')
  const redisPort = 6379
  const redisPassword = config.get('redisPassword')
  const redisUsername = config.get('redisUsername')
  const keyPrefix = config.get('redisKeyPrefix')
  let redisClient
  const provider = {
    constructor: redisHost ? CatboxRedis : CatboxMemory,
    options: {}
  }

  if (redisHost) {
    const redisOptions = {
      username: redisUsername,
      password: redisPassword,
      db,
      tls: {}
    }

    if (redisPassword) {
      redisOptions.password = redisPassword
    }

    if (config.get('useSingleInstanceCache')) {
      redisClient = new IoRedis({
        port: redisPort,
        host: config.get('redisHost'),
        db,
        keyPrefix
      })
    } else {
      redisClient = new IoRedis.Cluster(
        [
          {
            host: config.get('redisHost'),
            redisPort
          }
        ],
        {
          keyPrefix,
          slotsRefreshTimeout: 10000,
          dnsLookup: (address, callback) => callback(null, address),
          redisOptions: {
            username: config.get('redisUsername'),
            password: config.get('redisPassword'),
            db,
            tls: { servername: redisHost }
          }
        }
      )
    }

    redisClient.on('connect', () => {
      logger.info('Connected to Redis server')
    })

    redisClient.on('close', () => {
      logger.info('Redis connection closed attempting reconnect')
      redisClient.connect()
    })

    redisClient.on('error', (error) => {
      logger.error(`Redis connection error ${error}`)
    })

    provider.options = { redisClient, partition }
  } else {
    provider.options = { partition }
  }

  return provider
}
