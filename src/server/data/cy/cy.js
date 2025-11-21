import { navigationTranslationsWelsh } from './navigation-welsh.js'
import {
  daqiTranslationsWelsh,
  pollutantTranslationsWelsh,
  actionsReduceExposureTranslationsWelsh
} from './daqi-and-pollutants-welsh.js'
import {
  uiTranslationsWelsh,
  footerTranslationsWelsh
} from './footer-and-ui-welsh.js'

/**
 * Consolidated Welsh translations for the air quality service
 * Split into focused modules for maintainability
 */
export const welsh = {
  ...navigationTranslationsWelsh,
  ...daqiTranslationsWelsh,
  ...pollutantTranslationsWelsh,
  ...actionsReduceExposureTranslationsWelsh,
  ...uiTranslationsWelsh,
  ...footerTranslationsWelsh
}

// Re-export using export...from syntax for consistency
export { calendarWelsh, PAGE_NOT_FOUND_CY } from './navigation-welsh.js'
export { calendarWelshDays } from './footer-and-ui-welsh.js'
