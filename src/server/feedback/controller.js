/* eslint-disable prettier/prettier */
const feedbackController = {
  handler: (request, h) => {
    return h.view('feedback/index', {
      pageTitle: 'Check local air quality',
      heading: 'Check local air quality',
      page: 'feedback'
    })
  }
}

export { feedbackController }
