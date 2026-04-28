# aqie-front-end

Core delivery platform Node.js Frontend Template. Test for deploy.
Updated for SonarQube compliance

- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Local development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Local JSON API](#local-json-api)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
  - [Repository Access](#repository-access)
- [Documentation](#documentation)
  - [API specifications](#api-specifications)
  - [Operational runbooks](#operational-runbooks)
- [Docker](#docker)
  - [Development Image](#development-image)
  - [Production Image](#production-image)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Requirements

### Node.js

Please install [Node.js](http://nodejs.org/) `>= v22.16.0` and [npm](https://nodejs.org/) `>= v10`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
cd aqie-front-end
nvm use
```

## Local development

### Setup

Install application dependencies:

```bash
npm install
```

### Environment variables (.env)

#### Quick Setup

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. **Generate cookie passwords** (run twice for two different values):

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   Add to `.env`:

   ```env
   SESSION_COOKIE_PASSWORD=<first-generated-password>
   COOKIE_PASSWORD=<second-generated-password>
   ```

3. **Generate CDP X API Key**:
   - Open https://portal.cdp-int.defra.cloud/user-profile and sign in
   - Go to 'Developer API Key' section and generate a key for 'test'
   - Copy to `.env`: `CDP_X_API_KEY=<your-key>`
   - **Note:** Expires after 24 hours

4. **Get OS Names API Key** (ask an AQ colleague):

   ```env
   OS_NAMES_API_KEY=<key-from-colleague>
   ```

#### Available Variables

See `.env.example` for all available configuration options including:

- Proxy settings
- Mock OTP configuration (for local testing)
- Northern Ireland OAuth credentials (for NI postcode testing)

**Note:** Restart the dev server after updating `.env`

### Development

To run the application in `development` mode run:

```bash
npm run dev
```

If you update `.env`, restart the dev server to pick up changes.

### Local JSON API

Whilst the APIs are being developed this app uses a local JSON mock API. To start this locally run:

```bash
npm run mockApi
```

### Production

To mimic the application running in `production` mode locally run:

```bash
npm start
```

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json)
To view them in your command line run:

```bash
npm run
```

### Repository Access

To push changes to this repository, you must be added to the [air-quality team](https://github.com/orgs/DEFRA/teams/air-quality) by a GitHub admin in the DEFRA organisation.

## Documentation

### API specifications

- [Air Pollution Alerts API spec](./docs/AIR_POLLUTION_ALERTS_API_SPEC.md)

### Operational runbooks

- [Bot traffic + Redis session monitoring runbook](./docs/BOT_REDIS_TEST_RUNBOOK.md)

## Docker

### Development image

Build:

```bash
docker build --target development --no-cache --tag aqie-front-end:development .
```

Run:

```bash
docker run -p 3000:3000 aqie-front-end:development
```

### Production image

Build:

```bash
docker build --no-cache --tag aqie-front-end .
```

Run:

```bash
docker run -p 3000:3000 aqie-front-end
```

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
