/**
 * English translations for SMS notification journey
 * Covers mobile number input, code verification, and confirmation pages
 */
// ''
export const notificationTranslations = {
  // SMS Confirm Details page
  smsConfirmDetails: {
    pageTitle: 'Confirm you want to set up an alert',
    heading: 'Confirm you want to set up an alert for {location}',
    description: 'You are setting up an alert to get notified:',
    alertTypes: {
      forecast:
        'when the air quality forecast in {location} is high or very high',
      monitoring:
        'if a nearby monitoring site detects high or very high pollution levels anywhere within 25 miles of {location}'
    },
    summaryList: {
      mobileLabel: 'Mobile phone number',
      locationLabel: 'Location',
      changePhoneText: 'Change',
      changePhoneHidden: 'mobile phone number',
      changeLocationText: 'Change',
      changeLocationHidden: 'location'
    },
    question: 'Do you want to receive air quality alerts for this location?',
    radioYes: 'Yes, send me air quality alerts',
    radioNo: 'No, I do not want to receive alerts',
    continueButton: 'Continue',
    errors: {
      required: 'Select yes if you want to receive air quality alerts',
      duplicateAlert: {
        summary:
          'You have already set up an alert for {location}. Choose a different location or mobile phone number.',
        field:
          'Select yes if you want to receive air quality alerts for a different location'
      }
    }
  },
  // SMS Mobile Number page errors
  smsMobileNumber: {
    errors: {
      maxAlertsReached: {
        summary:
          'You have already added the maximum of 5 alerts for {phoneNumber}. Enter a different UK phone number.',
        field: 'Enter a UK mobile phone number, like 07700 900 982'
      }
    }
  }
}
