/**
 * Handles updating the active tab index in the URL when a tab is clicked.
 */
function handleTabs() {
    document.addEventListener('DOMContentLoaded', () => {
      const tabs = document.querySelector('.govuk-tabs') // Select the tabs element
      if (tabs) {
        tabs.addEventListener('click', () => {
          const activeTab = tabs.querySelector('.govuk-tabs__list-item--selected') // Find the selected tab
          if (activeTab) {
            const activeTabIndex = Array.from(
              tabs.querySelectorAll('.govuk-tabs__list-item')
            ).indexOf(activeTab) // Get the index of the selected tab
            const url = new URL(window.location.href) // Get the current URL
            url.searchParams.set('activeTab', activeTabIndex) // Update the activeTab query parameter
            window.history.replaceState({}, '', url) // Update the browser's URL without reloading
          }
        })
      }
    })
  }

  export { handleTabs }