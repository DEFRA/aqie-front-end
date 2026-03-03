import pino from 'pino' // Use the standard pino package instead of pino-esm

import { loggerOptions } from './logger-options.js'

const baseLogger = pino(loggerOptions)

// Emojis we treat as noisy debug markers; suppress in production only
const EMOJI_REGEX = /[🗺️🔍🧪🚨📱🔥🎯✨⭐️✅❌🚀]/u

function createLogger() {
  if (process.env.NODE_ENV === 'production') {
    const proxy = new Proxy(baseLogger, {
      get(target, prop, receiver) {
        // Always allow error logs to pass through
        if (prop === 'error') {
          return Reflect.get(target, prop, receiver).bind(target)
        }

        if (prop === 'info' || prop === 'warn' || prop === 'debug') {
          const original = Reflect.get(target, prop, receiver).bind(target)
          return (...args) => {
            // Join stringifiable parts to check for emoji markers
            try {
              const joined = args
                .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
                .join(' ')
              if (EMOJI_REGEX.test(joined)) {
                return // suppress noisy emoji logs in production
              }
            } catch {
              // If inspection fails, fall back to logging
            }
            return original(...args)
          }
        }
        // Default passthrough for all other members
        const value = Reflect.get(target, prop, receiver)
        return typeof value === 'function' ? value.bind(target) : value
      }
    })
    return proxy
  }
  return baseLogger
}

export { createLogger }
