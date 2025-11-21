''
import { navigationTranslations } from './navigation.js'
import {
  daqiTranslations,
  pollutantTranslations,
  actionsReduceExposureTranslations
} from './daqi-and-pollutants.js'
import { uiTranslations, footerTranslations } from './footer-and-ui.js'

/**
 * Consolidated English translations for the air quality service
 * Split into focused modules for maintainability
 */
export const english = {
  ...navigationTranslations,
  ...daqiTranslations,
  ...pollutantTranslations,
  ...actionsReduceExposureTranslations,
  ...uiTranslations,
  ...footerTranslations
}

// Re-export using export...from syntax for consistency
export { calendarEnglish } from './navigation.js'
