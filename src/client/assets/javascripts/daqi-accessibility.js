''
// DAQI Accessibility Enhancements
// GovUK tabs component handles all tab accessibility natively

function initDAQIAccessibility() {
  if (typeof document === 'undefined') return

  // '' No custom JavaScript needed - GovUK tabs handles screen reader accessibility
  console.log(
    'DAQI Accessibility: Relying on GovUK Frontend tabs component for accessibility'
  )
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDAQIAccessibility)
  } else {
    initDAQIAccessibility()
  }
}

// Export for application.js
export default {
  initDAQIAccessibility
}


// Export for testing (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initDAQIAccessibility }
}
