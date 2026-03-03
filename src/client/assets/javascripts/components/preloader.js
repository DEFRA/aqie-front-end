// ''

class Preloader {
  constructor(element) {
    this.element = element
  }

  init() {
    if (!(this.element instanceof HTMLElement)) {
      return
    }

    const statusUrl = this.element.getAttribute('data-status-url') || ''
    if (!statusUrl) {
      return
    }

    const retryUrl = this.element.getAttribute('data-retry-url') || ''
    const maxPolls = Number(this.element.getAttribute('data-max-polls') || 15)
    const pollIntervalMs = Number(
      this.element.getAttribute('data-poll-interval') || 2000
    )
    const initialDelayMs = Number(
      this.element.getAttribute('data-initial-delay') || 1000
    )

    let pollCount = 0

    const pollStatus = async () => {
      pollCount += 1

      if (pollCount > maxPolls) {
        if (retryUrl) {
          window.location.href = retryUrl
        }
        return
      }

      try {
        const response = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Status check failed')
        }

        const data = await response.json()

        if (data.status === 'complete' && data.redirectTo) {
          window.location.href = data.redirectTo
          return
        }

        if (data.status === 'failed' && data.redirectTo) {
          window.location.href = data.redirectTo
          return
        }

        window.setTimeout(pollStatus, pollIntervalMs)
      } catch (error) {
        window.setTimeout(pollStatus, pollIntervalMs)
      }
    }

    window.setTimeout(pollStatus, initialDelayMs)
  }
}

export default Preloader
