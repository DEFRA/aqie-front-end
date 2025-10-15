# Local Configuration Setup

This directory contains configuration files for local development.

## Files

- `local.example.json` - Template file with all configuration options
- `local.json` - Your personal local configuration (git-ignored)

## Setup Instructions

1. Copy the example file to create your local configuration:
   ```bash
   cp src/config/local.example.json src/config/local.json
   ```

2. Replace the placeholder values in `local.json` with your actual:
   - API keys
   - Passwords
   - Tokens  
   - Client credentials
   - Other sensitive information

## Configuration Variables

### Required for full functionality:
- `osNamesApiKey` - OS Names Places API key for location search
- `daqiePassword` - Password for DAQIE service authentication
- `cdpXApiKey` - CDP X API key for data access

### Session & Security:
- `session.cookie.password` - Must be at least 32 characters long
- `cookiePassword` - Must be at least 32 characters long

### Northern Ireland OAuth (optional):
- `oauthTokenNorthernIrelandTenantId` - Azure tenant ID
- `clientIdNIreland` - OAuth client ID  
- `clientSecretNIreland` - OAuth client secret
- `scopeNIreland` - OAuth scope

### Redis (optional):
- `redis.password` - Redis password if authentication is enabled

## Security Notes

- **Never commit `local.json` to git** - it contains sensitive information
- The `local.json` file is already in `.gitignore`
- Use strong, unique passwords for all password fields
- Keep API keys secure and rotate them regularly
- For production deployments, use environment variables instead

## Environment Variables

These local.json values correspond to the following environment variables:
- `osNamesApiKey` → `OS_NAMES_API_KEY`
- `daqiePassword` → `DAQIE_PASSWORD`  
- `session.cookie.password` → `SESSION_COOKIE_PASSWORD`
- `cookiePassword` → `COOKIE_PASSWORD`
- `cdpXApiKey` → `CDP_X_API_KEY`
- `oauthTokenNorthernIrelandTenantId` → `OAUTH_TOKEN_NORTHERN_IRELAND_API_TENANT_ID`
- `clientIdNIreland` → `OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_ID`
- `clientSecretNIreland` → `OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SECRET`
- `scopeNIreland` → `OS_PLACES_POSTCODE_NORTHERN_IRELAND_CLIENT_SCOPE`

Environment variables take precedence over local.json values.