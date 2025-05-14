import { TextEncoder, TextDecoder } from 'util'

// Polyfill TextEncoder and TextDecoder globally
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock ReadableStream globally
global.ReadableStream = class {
  constructor(data = []) {
    this.data = data
    this.locked = false
  }

  // Mock getReader method
  getReader() {
    let index = 0
    return {
      read: () => {
        if (index < this.data.length) {
          const value = this.data[index] // Extract the current value
          index++ // Increment the index in a dedicated statement
          return Promise.resolve({ value, done: false })
        }
        return Promise.resolve({ value: null, done: true })
      },
      releaseLock: () => {
        // Mock releaseLock method
      }
    }
  }

  // Mock cancel method
  cancel() {
    return Promise.resolve()
  }
}

global.afterEach(() => {
  // Clear down JSDOM document after each test
  document.getElementsByTagName('html')[0].innerHTML = ''
})
