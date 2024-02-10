function buildNavigation(request) {
  return [
    {
      text: 'Home2',
      url: '/',
      isActive: request.path === '/'
    }
  ]
}

export { buildNavigation }
