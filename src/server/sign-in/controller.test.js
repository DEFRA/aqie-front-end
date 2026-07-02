import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleSignInGet, handleSignInPost } from './controller.js'

vi.mock('../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'signIn.username') return 'admin'
      if (key === 'signIn.password') return 'password'
      return ''
    })
  }
}))

vi.mock('../data/en/en.js', () => ({
  english: {
    footerTxt: {},
    phaseBanner: {},
    cookieBanner: {}
  }
}))

vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.com')
}))

describe('sign-in controller', () => {
  let mockRequest, mockH

  beforeEach(() => {
    mockRequest = {
      yar: {
        get: vi.fn(),
        set: vi.fn(),
        clear: vi.fn()
      }
    }
    mockH = {
      view: vi.fn().mockReturnValue({ statusCode: 200 }),
      redirect: vi.fn().mockReturnValue({ statusCode: 302 })
    }
  })

  describe('handleSignInGet', () => {
    it('redirects to / if already authenticated', () => {
      mockRequest.yar.get.mockReturnValue(true)
      handleSignInGet(mockRequest, mockH)
      expect(mockH.redirect).toHaveBeenCalledWith('/')
    })

    it('renders sign-in view if not authenticated', () => {
      mockRequest.yar.get.mockReturnValue(false)
      handleSignInGet(mockRequest, mockH)
      expect(mockH.view).toHaveBeenCalledWith(
        'sign-in/index',
        expect.objectContaining({ errorMessage: null })
      )
    })
  })

  describe('handleSignInPost', () => {
    it('sets authenticated and redirects to / on correct credentials with no stored redirect', () => {
      mockRequest.payload = { username: 'admin', password: 'password' }
      mockRequest.yar.get.mockReturnValue(null)
      handleSignInPost(mockRequest, mockH)
      expect(mockRequest.yar.set).toHaveBeenCalledWith('authenticated', true)
      expect(mockH.redirect).toHaveBeenCalledWith('/')
    })

    it('redirects to stored signInRedirectTo path after sign in', () => {
      mockRequest.payload = { username: 'admin', password: 'password' }
      mockRequest.yar.get.mockImplementation((key) => {
        if (key === 'signInRedirectTo') return '/search-location'
        return null
      })
      handleSignInPost(mockRequest, mockH)
      expect(mockH.redirect).toHaveBeenCalledWith('/search-location')
      expect(mockRequest.yar.clear).toHaveBeenCalledWith('signInRedirectTo')
    })

    it('renders error view on wrong password', () => {
      mockRequest.payload = { username: 'admin', password: 'wrong' }
      handleSignInPost(mockRequest, mockH)
      expect(mockH.view).toHaveBeenCalledWith(
        'sign-in/index',
        expect.objectContaining({
          errorMessage: 'Incorrect username or password'
        })
      )
    })

    it('renders error view on wrong username', () => {
      mockRequest.payload = { username: 'notadmin', password: 'password' }
      handleSignInPost(mockRequest, mockH)
      expect(mockH.view).toHaveBeenCalledWith(
        'sign-in/index',
        expect.objectContaining({
          errorMessage: 'Incorrect username or password'
        })
      )
    })

    it('renders error view when payload is null', () => {
      mockRequest.payload = null
      handleSignInPost(mockRequest, mockH)
      expect(mockH.view).toHaveBeenCalledWith(
        'sign-in/index',
        expect.objectContaining({
          errorMessage: 'Incorrect username or password'
        })
      )
    })

    it('sets Error: prefix on page title when rendering error view', () => {
      mockRequest.payload = { username: 'admin', password: 'wrong' }
      handleSignInPost(mockRequest, mockH)
      expect(mockH.view).toHaveBeenCalledWith(
        'sign-in/index',
        expect.objectContaining({ pageTitle: 'Error: Sign in' })
      )
    })
  })
})
