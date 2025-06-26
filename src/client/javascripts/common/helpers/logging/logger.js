import pino from 'pino' // Import the pino library

// Create a pino logger instance
const pinoLogger = pino({
  level: 'error', // Set the log level
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: { colorize: true }
        }
      : undefined // Use JSON logs in production
})

// Define the logger utility
const logger = {
  error: (message, error) => {
    pinoLogger.error({ err: error }, message) // Log the error using pino
  }
}

export { logger }
