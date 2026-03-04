# Air Pollution Alerts API – Product & Technical Specification (Draft)

## 1. Overview

### Purpose

Build and maintain one or more API endpoints that provide air pollution alert data to the Authority for onward dissemination through the new GOV.UK citizen alerts service.

### Goals

1. Enable secure, reliable access to air pollution alerts data.
2. Support integration with the new GOV.UK citizen service.
3. Ensure the new GOV.UK Alerts Service is live by **31 March 2026**.

---

## 2. Scope

Defra’s new citizen service on GOV.UK requires a new **Air Pollution Alerts API** as an addition to the existing UK-AIR API.

The API must provide:

- A list of sites within a network/region that have pollution alerts.
- Current and historical threshold breaches.
- Site-level DAQI threshold breach indicators (for observed data).

The citizen service will:

- Derive **forecast DAQI breach alerts** from Met Office forecast data.
- Consume API-provided alerts (measured threshold breaches + historical breaches).
- Send notifications to subscribed users.

---

## 3. Alert Types and Threshold Rules

Alerts are triggered when thresholds in the Air Quality Standards Regulations (2010) are exceeded:

1. **Ozone – Information level**: 180 µg/m³ for 1 hour
2. **Ozone – Alert level**: 240 µg/m³ for 1 hour
3. **Sulphur Dioxide – Alert level**: 500 µg/m³ for 3 consecutive hours over 100 km²
4. **Nitrogen Dioxide – Alert level**: 400 µg/m³ for 3 consecutive hours over 100 km²

In addition, DAQI threshold breaches at site level must be exposed (observed data).
**Unvalidated alerts must not be made public.**

---

## 4. API Design

### API Style

- **Type**: REST
- **Format**: JSON
- **Protocol**: HTTPS only (HTTP disabled in production)

### Suggested Endpoint

`GET /api/alerts`

### Request Parameters

- `fromDate` (required): ISO 8601 datetime/date
- `toDate` (required): ISO 8601 datetime/date
- `siteId` (optional): string
- `samplingPointId` (optional): string
- `region` (optional): string

---

## 5. Response Contract (Draft)

Each alert record should include:

- `alertId` (UUID): unique identifier for alert event
- `samplingPointId` (string): unique ID for sampling point alert
- `siteId` (string): site with active alert (correlated with site metadata)
- `region` (string): region name/code
- `daqi` (number): DAQI value
- `pollutantType` (string): e.g. O₃, SO₂, NO₂
- `thresholdBreachLevel` (string): information/alert
- `informationThreshold` (string): threshold definition text
- `informationLevel` (boolean): true if information-level breach
- `alertThreshold` (string): threshold definition text
- `alertLevel` (boolean): true if alert-level breach
- `concentrationThresholdUgM3` (number): measured concentration
- `durationOfExceedance` (string): e.g. `PT1H`, `PT3H`
- `geographicalCoverage` (string): e.g. `100km2`
- `alertText` (string): display message
- `validationStatus` (integer):
  - `0` or `null`: not validated
  - `1`: false alarm
  - `2`: validated
  - `3`: auto validated
- `isPublic` (boolean): should only be true for validated/auto-validated records
- `breachTimestamp` (datetime): breach time
- `isHistorical` (boolean): indicates historical breach

### Example Response

```json
{
  "alerts": [
    {
      "alertId": "2f3ef1d1-7a61-44cf-bf12-8d0dd89ab123",
      "samplingPointId": "SP-12345",
      "siteId": "SITE-001",
      "region": "North West",
      "daqi": 7,
      "pollutantType": "O3",
      "thresholdBreachLevel": "information",
      "informationThreshold": "180 µg/m³ for 1 hour",
      "informationLevel": true,
      "alertThreshold": "240 µg/m³ for 1 hour",
      "alertLevel": false,
      "concentrationThresholdUgM3": 191,
      "durationOfExceedance": "PT1H",
      "geographicalCoverage": "site-level",
      "alertText": "Ozone information threshold exceeded.",
      "validationStatus": 2,
      "isPublic": true,
      "breachTimestamp": "2026-02-26T10:00:00Z",
      "isHistorical": false
    }
  ]
}
```

---

## 6. Non-Functional Requirements

### Performance

- p95 response time: **< 500ms** for single-query requests.

### Scalability

- Support up to **[TBD] requests/second** (to be confirmed with load profile).

### Availability

- **99.9% uptime**.

### Security

- OAuth 2.0 or API key authentication.
- TLS/HTTPS only.
- Access control for sensitive/non-public alerts.

### Compliance

- Conform to environmental data standards.
- GDPR and applicable UK data handling obligations.

---

## 7. Validation and Publishing Rules

- Unvalidated alerts (`validationStatus = 0/null`) must not be publicly exposed.
- False alarms (`validationStatus = 1`) must not be sent to end users.
- Only validated (`2`) or auto-validated (`3`) alerts may be published.
- State transitions and ownership of validation should be documented separately.

---

## 8. Monitoring, Logging, and Testing

### Monitoring

Capture and expose:

- Request count (day-wise and custom date range)
- Average response time
- Error rate (4xx/5xx)
- Availability/SLA adherence

### Logging

- Structured logs with correlation IDs
- Auth failures, validation failures, upstream dependency failures
- Audit trail for alert validation status changes

### Testing

- Contract tests for request/response schemas
- Threshold rule tests (per pollutant and duration)
- Performance/load tests
- Negative tests (auth failure, invalid params, unvalidated alert handling)

---

## 9. Documentation Deliverables

Provide Swagger/OpenAPI documentation including:

- Endpoint definitions
- Parameter descriptions and examples
- Success/error responses
- Authentication guidance
- Usage notes and sample queries/responses

---

## 10. Delivery Timeline

- GOV.UK Alerts Service target launch: **31 March 2026**
- Air Pollution Alerts API target readiness: **end of February to early March 2026**
- Recommended milestones:
  - API contract sign-off: immediate
  - Build + integration testing: by mid-February
  - Performance/security sign-off: by late February
  - Production readiness: early March

---

## 11. Open Items (To Confirm)

1. Final value for max requests/second (`[X]`).
2. Canonical source for `region` (site metadata mapping).
3. Exact status transition rules for `validationStatus`.
4. Historical breach retention window and query defaults.
5. Final endpoint naming/versioning (e.g. `/api/v1/alerts`).
