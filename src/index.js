import { config } from '~/src/config'
import { createServer } from '~/src/server'
import { createLogger } from '~/src/server/common/helpers/logging/logger'

const logger = createLogger()

process.on('unhandledRejection', (error) => {
  logger.info('Unhandled rejection')
  logger.error(error)
  process.exit(1)
})

// Function to start the server
const startServer = async (createServerFn, logger, config) => {
  const server = await createServerFn()
  await server.start()

  logger.info('Server started successfully')
  logger.info(`Access your frontend on http://localhost:${config.get('port')}`)
}

// Start the server and handle errors
startServer(createServer, logger, config).catch((error) => {
  logger.error('Failed to start server', error)
  process.exit(1)
})

export { startServer }
