/**
 * Search form loading indicator
 * Shows a loading overlay when search form is submitted
 * Prevents blank page flash during NI API processing and redirect
 */

class SearchLoading {
  constructor() {
    this.form = document.querySelector('form[name="search-form"]')
    this.loadingOverlay = null
    this.storageKey = 'search-loading-active'

    // '' Check if we're returning from a search
    this.checkLoadingState()

    if (this.form) {
      this.init()
    }
  }

  init() {
    // '' Create loading overlay
    this.createLoadingOverlay()

    // '' Add submit event listener
    this.form.addEventListener('submit', () => {
      // '' Set flag in sessionStorage to show loading on next page
      sessionStorage.setItem(this.storageKey, 'true')
      this.showLoading()
    })

    // '' Hide loading on page show (handles back button)
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        this.clearLoadingState()
      }
    })
  }

  checkLoadingState() {
    // '' Check if we should show loading (from previous page navigation)
    if (sessionStorage.getItem(this.storageKey) === 'true') {
      // '' Remove the inline loading class
      document.documentElement.classList.remove('search-loading-init')

      // '' Create and show proper overlay
      this.createLoadingOverlay()
      this.showLoading()

      const clearAfterRender = () => {
        // '' Small delay to ensure content is rendered
        setTimeout(() => {
          this.clearLoadingState()
        }, 100)
      }

      // '' Hide once page is loaded (or immediately if already loaded)
      if (document.readyState === 'complete') {
        clearAfterRender()
        return
      }

      window.addEventListener('load', clearAfterRender)
    }
  }

  createLoadingOverlay() {
    // '' Only create once
    if (this.loadingOverlay) return

    const existingOverlay = document.querySelector('.search-loading-overlay')
    if (existingOverlay) {
      this.loadingOverlay = existingOverlay
      this.loadingOverlay.setAttribute('aria-live', 'polite')
      this.loadingOverlay.setAttribute('aria-busy', 'true')
      this.loadingOverlay.setAttribute('role', 'status')
      return
    }

    // '' Create overlay element
    this.loadingOverlay = document.createElement('div')
    this.loadingOverlay.className = 'search-loading-overlay'
    this.loadingOverlay.setAttribute('aria-live', 'polite')
    this.loadingOverlay.setAttribute('aria-busy', 'true')
    this.loadingOverlay.setAttribute('role', 'status')

    // '' Create spinner and text
    this.loadingOverlay.innerHTML = `
      <div class="search-loading-content">
        <div class="search-loading-spinner" aria-hidden="true"></div>
        <p class="search-loading-text">Loading air quality data...</p>
      </div>
    `

    // '' Add to body (hidden by default)
    document.body.appendChild(this.loadingOverlay)
  }

  showLoading() {
    if (!this.loadingOverlay) {
      this.createLoadingOverlay()
    }
    this.loadingOverlay.classList.add('search-loading-overlay--visible')
    document.body.classList.add('search-loading-active')
  }

  clearLoadingState() {
    // '' Remove from sessionStorage
    sessionStorage.removeItem(this.storageKey)

    // '' Hide overlay
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove('search-loading-overlay--visible')
      document.body.classList.remove('search-loading-active')
    }
  }
}

// '' Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SearchLoading())
} else {
  new SearchLoading()
}

export default SearchLoading
