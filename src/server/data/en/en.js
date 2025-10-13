''
import { navigationTranslations, calendarEnglish } from './navigation.js'
import {
  daqiTranslations,
  pollutantTranslations
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
  ...uiTranslations,
  ...footerTranslations
}

export { calendarEnglish }
