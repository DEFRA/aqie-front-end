import {
  handleEmailVerifyCodeRequest,
  handleEmailVerifyCodePost
} from './controller.js'

// Route factory ''
const configureRoutes = (getController, postController) => [
  {
    method: 'GET',
    path: '/notify/register/email-verify-code',
    handler: getController.handler
  },
  {
    method: 'POST',
    path: '/notify/register/email-verify-code',
    handler: postController.handler
  }
]

const emailVerifyGetController = { handler: handleEmailVerifyCodeRequest }
const emailVerifyPostController = { handler: handleEmailVerifyCodePost }

const routes = configureRoutes(
  emailVerifyGetController,
  emailVerifyPostController
)

export {
  routes,
  configureRoutes,
  emailVerifyGetController,
  emailVerifyPostController
}
