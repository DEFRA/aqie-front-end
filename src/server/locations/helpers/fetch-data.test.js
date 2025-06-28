import { describe, it, expect } from 'vitest'

describe('Fetch Data Tests', () => {
  it('should fetch data successfully', async () => {
    const fetchData = async (url) => {
      return url === 'https://api.example.com/data'
        ? { data: 'Sample Data' }
        : null
    }
    const result = await fetchData('https://api.example.com/data')
    expect(result).toEqual({ data: 'Sample Data' })
  })

  it('should return null for invalid URL', async () => {
    const fetchData = async (url) => {
      return url === 'https://api.example.com/data'
        ? { data: 'Sample Data' }
        : null
    }
    const result = await fetchData('https://invalid-url.com')
    expect(result).toBeNull()
  })
})
