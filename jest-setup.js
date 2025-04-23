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
          return Promise.resolve({ value: this.data[index++], done: false })
        }
        return Promise.resolve({ value: undefined, done: true })
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
