''
import {
  navigationTranslationsWelsh,
  calendarWelsh,
  PAGE_NOT_FOUND_CY
} from './navigation-welsh.js'
import {
  daqiTranslationsWelsh,
  pollutantTranslationsWelsh
} from './daqi-and-pollutants-welsh.js'
import {
  uiTranslationsWelsh,
  footerTranslationsWelsh,
  calendarWelshDays
} from './footer-and-ui-welsh.js'

/**
 * Consolidated Welsh translations for the air quality service
 * Split into focused modules for maintainability
 */
export const welsh = {
  ...navigationTranslationsWelsh,
  ...daqiTranslationsWelsh,
  ...pollutantTranslationsWelsh,
  ...uiTranslationsWelsh,
  ...footerTranslationsWelsh
}

export { calendarWelsh, PAGE_NOT_FOUND_CY, calendarWelshDays }
