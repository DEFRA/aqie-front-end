import http from 'http'

console.log('Starting HTTP test client...')

// Simple test to see if we can make HTTP requests
const options = {
  hostname: '127.0.0.1',
  port: 3003,
  path: '/debug-middleware',
  method: 'GET'
}

console.log('Making internal HTTP request to test server...')

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`)
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
  res.setEncoding('utf8')
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`)
  })
  res.on('end', () => {
    console.log('Response received')
    process.exit(0)
  })
})

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`)
  process.exit(1)
})

req.setTimeout(5000, () => {
  console.log('Request timed out')
  req.destroy()
  process.exit(1)
})

console.log('Sending request...')
req.end()
console.log('Request sent, waiting for response...')
