import Hapi from '@hapi/hapi'

async function init() {
  const server = Hapi.server({
    port: 3004,
    host: 'localhost'
  })

  server.route({
    method: 'GET',
    path: '/test',
    handler: () => {
      return { message: 'Hello World!' }
    }
  })

  await server.start()
  console.log('Test server running on %s', server.info.uri)
}

init()
