import pino from 'pino' // Use the standard pino package instead of pino-esm

import { loggerOptions } from './logger-options.js'

const logger = pino(loggerOptions)

function createLogger() {
  return logger
}

export { createLogger }
