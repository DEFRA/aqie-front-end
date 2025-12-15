/**
 * Welsh translations for SMS notification journey
 * Covers mobile number input, code verification, and confirmation pages
 */
// ''
export const notificationTranslationsWelsh = {
  // SMS Confirm Details page
  smsConfirmDetails: {
    pageTitle: 'Cadarnhau eich bod am sefydlu rhybudd',
    heading: 'Cadarnhau eich bod am sefydlu rhybudd ar gyfer {location}',
    description: "Rydych chi'n sefydlu rhybudd i gael eich hysbysu:",
    alertTypes: {
      forecast:
        "pan fydd y rhagolwg ansawdd aer yn {location} yn uchel neu'n uchel iawn",
      monitoring:
        'os bydd safle monitro cyfagos yn canfod lefelau llygredd uchel neu uchel iawn unrhyw le o fewn 25 milltir o {location}'
    },
    summaryList: {
      mobileLabel: 'Rhif ffôn symudol',
      locationLabel: 'Lleoliad',
      changePhoneText: 'Newid',
      changePhoneHidden: 'rhif ffôn symudol',
      changeLocationText: 'Newid',
      changeLocationHidden: 'lleoliad'
    },
    question:
      'A ydych chi am dderbyn rhybuddion ansawdd aer ar gyfer y lleoliad hwn?',
    radioYes: 'Ydw, anfonwch rybuddion ansawdd aer ataf',
    radioNo: 'Nac ydw, nid wyf am dderbyn rhybuddion',
    continueButton: 'Parhau',
    errors: {
      required: 'Dewiswch ie os ydych chi am dderbyn rhybuddion ansawdd aer'
    }
  }
}
