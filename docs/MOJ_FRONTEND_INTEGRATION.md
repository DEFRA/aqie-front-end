# MOJ Frontend Integration Guide

This guide explains how to integrate the [MOJ Frontend](https://design-patterns.service.justice.gov.uk/get-started/setting-up-moj-frontend/) library alongside the existing GOV.UK Frontend in this project.

## Step 1 — Install

```bash
npm install @ministryofjustice/frontend
```

---

## Step 2 — SCSS

File: `src/client/assets/stylesheets/application.scss`

Add the MOJ import **after** the existing govuk-frontend line using `@use`:

```scss
@import '~govuk-frontend/dist/govuk/index';
@use '~@ministryofjustice/frontend/moj/all'; // add this
```

> **Note:** `@use` is the modern Sass replacement for `@import`, which is deprecated in Dart Sass 3.0.0 (you'll have seen those warnings in the webpack build output). Use `@use` for any new additions. The existing `@import` for govuk-frontend can be migrated separately.
>
> If you need access to MOJ Sass variables or mixins elsewhere in your SCSS (not just the compiled styles), use `@use ... as *` to avoid needing a namespace prefix:
>
> ```scss
> @use '~@ministryofjustice/frontend/moj/all' as *;
> ```

---

## Step 3 — Nunjucks template paths

File: `src/config/nunjucks/index.js`

Add the MOJ templates path to the `nunjucks.configure()` array alongside the existing govuk-frontend paths:

```js
path.resolve(currentDir, '../../node_modules/@ministryofjustice/frontend'),
```

---

## Step 4 — JavaScript initialisation

File: `src/client/assets/javascripts/application.js`

Add alongside the existing govuk-frontend `initAll` call:

```js
import { initAll as mojInitAll } from '@ministryofjustice/frontend'
mojInitAll()
```

> **Note:** Use the bare package name `@ministryofjustice/frontend` — webpack resolves to the `main` field (`moj/all.js`) in the package. The path `@ministryofjustice/frontend/moj/all` (without `.js`) does **not** exist and will cause a webpack module-not-found error.

---

## Step 5 — Import macro in page.njk

File: `src/server/common/templates/layouts/page.njk`

Add the macro import alongside the other GOV.UK macro imports at the top of the file:

```njk
{% from "moj/components/banner/macro.njk" import mojBanner %}
```

Because all templates in this project extend `layouts/page.njk`, the macro will be available in every template automatically — no need to import it again per page.

---

## Step 6 — Use in any template

Any template that extends `layouts/page.njk` can use the macro directly:

```njk
{{ mojBanner({ text: "Example" }) }}
```

---

## Notes

- MOJ components inherit GOV.UK typography, colour, and spacing — no duplication needed.
- Always check the [MOJ component list](https://design-patterns.service.justice.gov.uk/components/) before building a custom component.
- The `~` prefix in SCSS resolves to `node_modules/` via the existing webpack sass-loader configuration — no additional webpack changes are required.
