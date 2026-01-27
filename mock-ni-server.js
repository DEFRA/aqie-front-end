/**
 * Mock Northern Ireland API Server
 * Serves data from db.json file
 * Run with: node mock-ni-server.js
 */

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PORT = 5000
const dirName = dirname(fileURLToPath(import.meta.url))
const dbPath = join(dirName, 'db.json')

// Load data from db.json
let dbData
try {
  const fileContent = readFileSync(dbPath, 'utf-8')
  dbData = JSON.parse(fileContent)
} catch (error) {
  console.error('Error loading db.json:', error.message)
  process.exit(1)
}

const server = createServer((req, res) => {
  const HTTP_OK = 200
  const HTTP_NOT_FOUND = 404
  const url = new URL(req.url, `http://localhost:${PORT}`)

  if (url.pathname === '/results' && req.method === 'GET') {
    const postcode = url.searchParams.get('postcode') || ''
    const limit = Number.parseInt(url.searchParams.get('_limit') || '1', 10)

    // Filter results by postcode (case-insensitive, spaces ignored)
    const normalizedSearch = postcode.toUpperCase().replaceAll(/\s/g, '')
    const results = dbData.results
      .filter((item) => {
        const normalizedPostcode = item.postcode
          .toUpperCase()
          .replaceAll(/\s/g, '')
        return normalizedPostcode.includes(normalizedSearch)
      })
      .slice(0, limit)

    res.writeHead(HTTP_OK, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
    res.end(JSON.stringify(results))
    console.log(
      `[${new Date().toISOString()}] GET /results?postcode=${postcode} - Found ${results.length} result(s)`
    )
  } else {
    res.writeHead(HTTP_NOT_FOUND, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not Found' }))
  }
})

server.listen(PORT, () => {
  console.log(`Mock NI API server running on http://localhost:${PORT}`)
  console.log(`Serving data from: ${dbPath}`)
  console.log(`Example: http://localhost:${PORT}/results?postcode=BT1%201AA`)
  console.log(
    `Available postcodes: ${dbData.results.map((r) => r.postcode).join(', ')}`
  )
})
