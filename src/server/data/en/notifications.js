/**
 * English translations for SMS and Email notification journeys
 * Covers mobile number input, email input, code verification, and confirmation pages
 */
// ''
const SERVICE_NAME = 'Check air quality'

export const notificationTranslations = {
  // Common notification settings
  common: {
    serviceName: SERVICE_NAME,
    textAlertsPage: 'Text alerts',
    emailAlertsPage: 'Email alerts'
  },
  // SMS Mobile Phone Number Entry page
  smsMobilePhone: {
    pageTitle: 'What is your mobile phone number?',
    heading: 'What is your mobile phone number?',
    description:
      'We will send you a text message with a 5-digit activation code.',
    inputLabel: 'Enter your mobile phone number'
  },
  // Email Address Entry page
  emailEnterEmail: {
    pageTitle: 'What is your email address?',
    heading: 'What is your email address?',
    description: 'We will send you an email containing an activation link.',
    inputLabel: 'Enter your email address'
  },
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
