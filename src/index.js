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
const startServer = async (createServerFn, _localLogger, serverConfig) => {
  const server = await createServerFn()
  await server.start()

  logger.info('Server started successfully')
  logger.info(
    `Access your frontend on http://localhost:${serverConfig.get('port')}`
  )
}

// Start the server and handle errors
startServer(createServer, logger, config).catch((error) => {
  // Use the global logger here
  logger.error('Failed to start server', error)
  process.exit(1)
})

export { startServer }
