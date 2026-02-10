/**
 * Search form loading indicator
 * Shows a loading overlay when search form is submitted
 * Prevents blank page flash during NI API processing and redirect
 */

class SearchLoading {
  constructor() {
    this.form = document.querySelector('form[name="search-form"]')
    this.loadingOverlay = null

    if (this.form) {
      this.init()
    }
  }

  init() {
    // '' Create loading overlay
    this.createLoadingOverlay()

    // '' Add submit event listener
    this.form.addEventListener('submit', () => {
      this.showLoading()
    })

    // '' Hide loading on page show (handles back button)
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        this.hideLoading()
      }
    })

    // '' Hide loading if page is visible (handles redirect completion)
    if (document.visibilityState === 'visible') {
      this.hideLoading()
    }
  }

  createLoadingOverlay() {
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
        <p class="search-loading-text">Searching for location...</p>
      </div>
    `

    // '' Add to body (hidden by default)
    document.body.appendChild(this.loadingOverlay)
  }

  showLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('search-loading-overlay--visible')
      document.body.classList.add('search-loading-active')
    }
  }

  hideLoading() {
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
