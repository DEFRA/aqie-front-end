import { createServer } from '../../index.js'
import { config } from '../../../config/index.js'
import { createLogger } from './logging/logger.js'
import process from 'node:process'

async function startServer() {
  let server

  try {
    server = await createServer()
    await server.start()

    server.logger.info('Server started successfully')
    server.logger.info(
      `Access your frontend on http://localhost:${config.get('port')}`
    )

    // '' Warn early if OS Names key is missing, as UK searches will fail locally
    if (!config.get('osNamesApiKey')) {
      server.logger.warn(
        'OS_NAMES_API_KEY is not set. UK postcode/name searches will return "Page not found" locally. Add it to .env and restart.'
      )
    }

    process.on('SIGTERM', async () => {
      try {
        server.logger.info('Received SIGTERM, shutting down gracefully...')

        // Cleanup worker processes if any
        if (server.workerPool) {
          try {
            await server.workerPool.terminate()
            server.logger.info('Worker pool terminated successfully')
          } catch (error) {
            server.logger.error('Error while terminating worker pool', error)
          }
        }

        // Stop the server
        await server.stop()
        server.logger.info('Server stopped successfully')

        process.exit(0)
      } catch (error) {
        server.logger.error('Error during shutdown', error)
        process.exit(1)
      }
    })
  } catch (error) {
    const logger = createLogger()
    logger.info('Server failed to start :(')
    logger.error(error)
  }

  return server
}

export { startServer }
