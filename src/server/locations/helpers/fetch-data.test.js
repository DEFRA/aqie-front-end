''
// Unit tests for fetch-data.js
const { fetchData } = require('./fetch-data')
const axios = require('axios')

jest.mock('axios')

describe('fetchData', () => {
  it('should fetch data successfully', async () => {
    axios.get.mockResolvedValue({ data: { key: 'value' } })
    const mockRequest = {
      yar: {
        get: jest.fn(),
        set: jest.fn(),
        clear: jest.fn()
      }
    }
    const mockH = {}
    const mockParams = {
      locationType: 'uk-location',
      userLocation: 'London',
      searchTerms: 'search-term',
      secondSearchTerm: 'second-term'
    }

    const result = await fetchData(mockRequest, mockH, mockParams)
    expect(result).toEqual(expect.any(Object))
  })

  it('should handle errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'))
    const mockRequest = {
      yar: {
        get: jest.fn(),
        set: jest.fn(),
        clear: jest.fn()
      }
    }
    const mockH = {}
    const mockParams = {
      locationType: 'uk-location',
      userLocation: 'London',
      searchTerms: 'search-term',
      secondSearchTerm: 'second-term'
    }

    const result = await fetchData(mockRequest, mockH, mockParams)
    expect(result).toBeNull()
  })
})
