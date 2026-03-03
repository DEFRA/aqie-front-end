# Notify Util Samples

This folder contains concrete usage examples for the utilities in `notify-util/index.js`.

Included samples:

- `token-samples.js`: Demonstrates `generateUnsubscribeToken`, `verifyUnsubscribeToken`, `buildUnsubscribeLink`, `toBase64Url`, `fromBase64Url`, and `createHmacSignature`.
- `redaction-samples.js`: Demonstrates `redactPhone`, `redactEmail`, and `redactObject`.
- `sms-command-samples.js`: Demonstrates `parseInboundSmsCommand`.

Run samples (optional):

```
node notify-util/samples/token-samples.js
node notify-util/samples/redaction-samples.js
node notify-util/samples/sms-command-samples.js
```

Note: These scripts use ESM imports and synchronous functions, with basic error handling where appropriate.
