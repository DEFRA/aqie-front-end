// '' - Tests for replaceLocationId helper
import { describe, it, expect } from 'vitest'
import { replaceLocationId } from './replace-location-id.js'

describe('replaceLocationId', () => {
  describe('basic functionality', () => {
    it('should replace locationId placeholder in string fields', () => {
      const airQuality = {
        message: 'Air quality at {locationId} is good',
        title: 'Location: {locationId}'
      }
      const result = replaceLocationId(airQuality, 'LOC123', 'Test Location')
      expect(result.message).toBe('Air quality at LOC123 is good')
      expect(result.title).toBe('Location: LOC123')
    })

    it('should replace locationName placeholder in string fields', () => {
      const airQuality = {
        message: 'Welcome to {locationName}',
        description: 'Air quality in {locationName} today'
      }
      const result = replaceLocationId(airQuality, 'LOC123', 'London')
      expect(result.message).toBe('Welcome to London')
      expect(result.description).toBe('Air quality in London today')
    })

    it('should replace both placeholders in same string', () => {
      const airQuality = {
        message: '{locationName} ({locationId}) air quality'
      }
      const result = replaceLocationId(airQuality, 'LOC123', 'London')
      expect(result.message).toBe('London (LOC123) air quality')
    })
  })

  describe('nested objects', () => {
    it('should replace placeholders in nested object properties', () => {
      const airQuality = {
        location: {
          name: '{locationName}',
          id: '{locationId}'
        },
        message: 'Check air quality at {locationName}'
      }
      const result = replaceLocationId(airQuality, 'LOC456', 'Manchester')
      expect(result.location.name).toBe('Manchester')
      expect(result.location.id).toBe('LOC456')
      expect(result.message).toBe('Check air quality at Manchester')
    })

    it('should handle one level of nested objects', () => {
      const airQuality = {
        data: {
          name: '{locationName}',
          code: '{locationId}'
        }
      }
      const result = replaceLocationId(airQuality, 'ABC123', 'Birmingham')
      expect(result.data.name).toBe('Birmingham')
      expect(result.data.code).toBe('ABC123')
    })
  })

  describe('edge cases', () => {
    it('should return input if airQuality is null', () => {
      const result = replaceLocationId(null, 'LOC123', 'London')
      expect(result).toBeNull()
    })

    it('should return input if airQuality is undefined', () => {
      const result = replaceLocationId(undefined, 'LOC123', 'London')
      expect(result).toBeUndefined()
    })

    it('should return input if airQuality is not an object', () => {
      expect(replaceLocationId('string', 'LOC123', 'London')).toBe('string')
      expect(replaceLocationId(123, 'LOC123', 'London')).toBe(123)
      expect(replaceLocationId(true, 'LOC123', 'London')).toBe(true)
    })

    it('should handle empty strings for locationId', () => {
      const airQuality = {
        message: 'Location: {locationId}'
      }
      const result = replaceLocationId(airQuality, '', 'London')
      expect(result.message).toBe('Location: ')
    })

    it('should handle empty strings for locationName', () => {
      const airQuality = {
        message: 'Welcome to {locationName}'
      }
      const result = replaceLocationId(airQuality, 'LOC123', '')
      expect(result.message).toBe('Welcome to ')
    })

    it('should use headerTitle as fallback for locationName', () => {
      const airQuality = {
        message: 'Welcome to {locationName}'
      }
      const result = replaceLocationId(airQuality, 'LOC123', '', 'Header Title')
      expect(result.message).toBe('Welcome to Header Title')
    })

    it('should prefer locationName over headerTitle when both provided', () => {
      const airQuality = {
        message: 'Welcome to {locationName}'
      }
      const result = replaceLocationId(
        airQuality,
        'LOC123',
        'Location Name',
        'Header Title'
      )
      expect(result.message).toBe('Welcome to Location Name')
    })

    it('should handle undefined locationId and locationName', () => {
      const airQuality = {
        message: '{locationId} - {locationName}'
      }
      const result = replaceLocationId(airQuality)
      expect(result.message).toBe(' - ')
    })
  })

  describe('data integrity', () => {
    it('should not mutate original object', () => {
      const airQuality = {
        message: 'Location: {locationId}',
        nested: {
          name: '{locationName}'
        }
      }
      const original = JSON.stringify(airQuality)
      replaceLocationId(airQuality, 'LOC123', 'London')
      expect(JSON.stringify(airQuality)).toBe(original)
    })

    it('should preserve non-string fields', () => {
      const airQuality = {
        message: '{locationName}',
        count: 42,
        active: true,
        data: null,
        items: [1, 2, 3]
      }
      const result = replaceLocationId(airQuality, 'LOC123', 'London')
      expect(result.message).toBe('London')
      expect(result.count).toBe(42)
      expect(result.active).toBe(true)
      expect(result.data).toBeNull()
      expect(result.items).toEqual([1, 2, 3])
    })

    it('should handle objects with null values', () => {
      const airQuality = {
        message: '{locationName}',
        optional: null
      }
      const result = replaceLocationId(airQuality, 'LOC123', 'London')
      expect(result.message).toBe('London')
      expect(result.optional).toBeNull()
    })
  })

  describe('multiple replacements', () => {
    it('should replace multiple occurrences of same placeholder', () => {
      const airQuality = {
        message:
          '{locationName} air quality. Visit {locationName} for more info about {locationName}'
      }
      const result = replaceLocationId(airQuality, 'LOC123', 'London')
      expect(result.message).toBe(
        'London air quality. Visit London for more info about London'
      )
    })

    it('should handle mixed placeholders in multiple fields', () => {
      const airQuality = {
        title: '{locationName}',
        id: '{locationId}',
        description: 'Air quality at {locationName} (ID: {locationId})',
        nested: {
          location: '{locationName}',
          code: '{locationId}'
        }
      }
      const result = replaceLocationId(airQuality, 'ABC123', 'Test City')
      expect(result.title).toBe('Test City')
      expect(result.id).toBe('ABC123')
      expect(result.description).toBe('Air quality at Test City (ID: ABC123)')
      expect(result.nested.location).toBe('Test City')
      expect(result.nested.code).toBe('ABC123')
    })
  })
})
