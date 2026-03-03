# Unit Test Coverage Improvement Plan

# Target: 90% Coverage by End of Sprint

## Current Status

- **Current Coverage**: 64.11%
- **Target Coverage**: 90%
- **Gap to Close**: +25.89%
- **Estimated Lines to Test**: ~2,101 additional lines

## Phase-by-Phase Implementation

### Phase 1: Critical Infrastructure (Week 1)

**Goal: 64% → 72% (+8%)**

#### High Impact Files (0% Coverage)

1. **src/server/index.js** (100 lines)
   - [ ] Server initialization tests
   - [ ] Plugin registration validation
   - [ ] Configuration loading
   - [ ] Error handling during startup
   - **Estimated Effort**: 4 hours
   - **Expected Coverage**: 85%

2. **src/server/data/monitoring-sites.js** (50 lines)
   - [ ] Data export validation
   - [ ] Module structure tests
   - **Estimated Effort**: 1 hour
   - **Expected Coverage**: 90%

3. **Config Files**
   - [ ] `src/config/nunjucks/globals.js` (1 line)
   - [ ] `src/config/nunjucks/context.js`
   - **Estimated Effort**: 2 hours
   - **Expected Coverage**: 85%

### Phase 2: Core Business Logic (Week 2)

**Goal: 72% → 84% (+12%)**

#### Critical Controllers (10-17% Coverage)

1. **src/server/locations/controller.js** (80 lines, 16.41%)
   - [ ] `determineLanguage()` function testing
   - [ ] `prepareViewData()` logic validation
   - [ ] `getLocationDataController` handler tests
   - [ ] Error scenarios and edge cases
   - **Estimated Effort**: 6 hours
   - **Expected Coverage**: 85%

2. **src/server/locations/middleware.js** (273 lines, 6.95%)
   - [ ] Request preprocessing logic
   - [ ] Location data handling
   - [ ] Error routing and fallbacks
   - [ ] Language-specific redirects
   - **Estimated Effort**: 8 hours
   - **Expected Coverage**: 80%

3. **src/server/location-id/controller.js** (312 lines, 10.03%)
   - [ ] Location ID validation
   - [ ] Data retrieval logic
   - [ ] Response formatting
   - [ ] Welsh language support
   - **Estimated Effort**: 10 hours
   - **Expected Coverage**: 85%

#### Welsh Language Controllers (0% Coverage)

4. **src/server/location-id/cy/controller.js** (195 lines)
5. **src/server/locations/cy/controller.js** (190 lines)
6. **src/server/locations/cy/middleware-cy.js** (347 lines)
   - [ ] Welsh language path testing
   - [ ] Localization validation
   - [ ] Parallel functionality with English versions
   - **Combined Effort**: 12 hours
   - **Expected Coverage**: 75%

### Phase 3: Helper Functions (Week 3)

**Goal: 84% → 89% (+5%)**

#### Location Processing Helpers

1. **middleware-helpers.js** (265 lines, 22.26%)
   - [ ] `handleSingleMatch()` function
   - [ ] `handleMultipleMatches()` function
   - [ ] Location data processing
   - **Effort**: 6 hours, **Coverage**: 85%

2. **fetch-data.js** (300 lines, 10.58%)
   - [ ] API data retrieval
   - [ ] Error handling and retries
   - [ ] Data transformation
   - **Effort**: 8 hours, **Coverage**: 80%

3. **filter-matches.js** (122 lines, 24.1%)
   - [ ] Location matching algorithms
   - [ ] Search filtering logic
   - **Effort**: 4 hours, **Coverage**: 85%

#### Utility Functions (Various Coverage 0-70%)

4. **String & Data Helpers**
   - air-quality-values.js (37 lines, 11.42%)
   - convert-string.js (149 lines, 66.48%)
   - get-id-match.js (37 lines, 2.85%)
   - get-nearest-location.js (253 lines, 5.15%)
   - **Combined Effort**: 10 hours, **Coverage**: 85%

### Phase 4: Final Push to 90% (Week 4)

**Goal: 89% → 90%+ (+1-2%)**

#### Branch Coverage & Edge Cases

1. **Improve Branch Coverage** (Currently 82.93%)
   - [ ] Add conditional logic tests
   - [ ] Test error pathways
   - [ ] Validate default fallbacks
   - **Effort**: 6 hours

2. **Configuration & Integration**
   - [ ] Complete nunjucks config testing
   - [ ] Moment.js filter edge cases
   - [ ] Integration test scenarios
   - **Effort**: 4 hours

## Implementation Strategy

### Testing Patterns to Follow

#### 1. Controller Testing Template

```javascript
describe('LocationController', () => {
  it('should determine correct language from query params', () => {})
  it('should handle missing language gracefully', () => {})
  it('should prepare view data correctly', () => {})
  it('should handle errors appropriately', () => {})
})
```

#### 2. Helper Function Testing Template

```javascript
describe('HelperFunction', () => {
  it('should process valid input correctly', () => {})
  it('should handle edge cases', () => {})
  it('should throw appropriate errors', () => {})
  it('should validate input parameters', () => {})
})
```

#### 3. Middleware Testing Template

```javascript
describe('Middleware', () => {
  it('should process requests correctly', () => {})
  it('should handle authentication', () => {})
  it('should validate request data', () => {})
  it('should route errors appropriately', () => {})
})
```

## Quality Gates

### After Each Phase

- [ ] Run full test suite
- [ ] Verify coverage targets met
- [ ] Validate no regression in existing tests
- [ ] Code review for test quality

### Success Criteria

- **90%+ Statement Coverage**
- **85%+ Branch Coverage**
- **85%+ Function Coverage**
- **No broken existing functionality**
- **Maintainable test code**

## Risk Mitigation

### Potential Challenges

1. **Complex Welsh Language Logic**: May need linguistic validation
2. **Location API Dependencies**: Mock external services appropriately
3. **Legacy Code Patterns**: May require refactoring for testability
4. **Integration Complexity**: Server startup and plugin interactions

### Mitigation Strategies

- Use comprehensive mocking for external dependencies
- Focus on unit tests over integration tests initially
- Refactor only when necessary for testability
- Create helper utilities for common test scenarios

## Timeline Summary

| Week | Phase          | Coverage Target | Key Deliverables                       |
| ---- | -------------- | --------------- | -------------------------------------- |
| 1    | Infrastructure | 72%             | Server, config, data layer tests       |
| 2    | Core Logic     | 84%             | Controllers, middleware tests          |
| 3    | Helpers        | 89%             | Utility functions, location processing |
| 4    | Final Push     | 90%+            | Edge cases, branch coverage            |

**Total Estimated Effort**: 85 hours over 4 weeks
**Success Probability**: High (based on existing test patterns)
