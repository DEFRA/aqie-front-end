<!-- '' -->

# Loading Preloader Guide

This guide describes how to reuse the loading preloader pattern in new flows.

## What you get

- A reusable Nunjucks component for the preloader UI.
- A helper for building view models and status responses.
- A reusable polling script that reads `data-*` attributes.
- A standard status contract for API polling.

## Component

Use the loading component in a Nunjucks view:

```nunjucks
{{ appLoading({
  heading: "Loading air quality data",
  body: "We are gathering air quality information for your area.",
  statusText: "Loading…",
  statusUrl: "/loading-status",
  retryUrl: "/retry?postcode=BT1%201AA&lang=en",
  maxPolls: 15,
  pollIntervalMs: 2000,
  initialDelayMs: 1000
}) }}
```

The component renders:

- `data-module="app-preloader"`
- `data-status-url`, `data-retry-url`
- `data-max-polls`, `data-poll-interval`, `data-initial-delay`

## Spinner block (shared)

To reuse the spinner block outside the full page preloader (for example, on the retry page), use the shared status block:

```nunjucks
{{
  appLoadingStatus({
    statusText: "Retrying air quality data…",
    classes: "retry-loading-status govuk-!-display-none"
  })
}}
```

## Helper

Use the helper to create consistent view models and status responses:

```js
import {
  resolvePreloaderLanguage,
  buildPreloaderViewModel,
  buildPreloaderStatusResponse
} from '../common/helpers/preloader.js'
```

### View model

```js
const viewModel = buildPreloaderViewModel({
  lang,
  metaSiteUrl,
  pageTitle: 'Loading air quality data',
  description: 'Loading air quality data for your location.',
  page: 'Check air quality',
  serviceName: 'Check air quality',
  phaseBanner,
  footerTxt,
  cookieBanner,
  currentPath: '/loading',
  heading: 'Loading air quality data',
  body: 'We are gathering air quality information for your area.',
  statusText: 'Loading…',
  retryUrl: '/retry?postcode=BT1%201AA&lang=en'
})
```

### Status response

```js
return buildPreloaderStatusResponse({
  h,
  isProcessing,
  hasError,
  redirectTo,
  retryRedirect: '/retry?postcode=BT1%201AA&lang=en',
  defaultRedirect: '/search-location'
})
```

## Status contract

The polling endpoint should return JSON:

```json
{ "status": "processing" }
{ "status": "complete", "redirectTo": "/location/123" }
{ "status": "failed", "redirectTo": "/retry?postcode=BT1%201AA&lang=en" }
```

## Script behavior

The preloader script:

- polls `data-status-url` every `data-poll-interval` ms
- redirects to `redirectTo` when `status` is `complete` or `failed`
- redirects to `data-retry-url` when max polls is exceeded

## Files

- Component: `src/server/common/components/loading/`
- Script: `src/client/assets/javascripts/components/preloader.js`
- Helper: `src/server/common/helpers/preloader.js`
- Styles: `src/client/assets/stylesheets/components/_loading.scss`
