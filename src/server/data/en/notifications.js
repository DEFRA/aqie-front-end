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
    emailAlertsPage: 'Email alerts',
    errorSummaryTitle: 'There is a problem',
    backLinkText: 'Back'
  },
  // SMS Mobile Phone Number Entry page
  smsMobilePhone: {
    pageTitle: 'What is your mobile phone number?',
    heading: 'What is your mobile phone number?',
    description:
      'We will send you a text message with a 5-digit activation code.',
    inputLabel: 'Enter your mobile phone number',
    continueButton: 'Continue',
    alertLimitHint: 'You can add up to 5 alerts for each mobile phone number.',
    errors: {
      empty: 'Enter your mobile phone number',
      format: 'Enter a UK mobile phone number, like 07700 900 982'
    }
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
        'if a monitoring site measures high or very high pollution levels in this area'
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
    continueButton: 'Confirm and set up alert',
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
  },
  // SMS send activation page
  smsSendActivation: {
    pageTitle: 'We are going to send you an activation code',
    heading: 'We are going to send you an activation code',
    bodyText:
      'We will send a text message to {mobileNumber} with a 5-digit activation code.',
    continueButton: 'Agree and continue',
    changeNumberLinkText: 'I want to use a different mobile number'
  },
  // SMS verify code page
  smsVerifyCode: {
    pageTitle: 'Check your mobile phone',
    errorPageTitle: 'Error: Check your mobile phone',
    heading: 'Check your mobile phone',
    bodyText:
      "We've sent a text message to {mobileNumber} with a 5 digit activation code.",
    label: 'Enter the code to activate your air pollution alert.',
    codeExpiryText: 'The code expires in 15 minutes.',
    detailsSummary: 'Not received a text message?',
    detailsIntro: 'Text messages sometimes take a few minutes to arrive.',
    detailsChecklistIntro:
      'If you have not received the text message after 10 minutes, check that:',
    detailsBulletNumber: 'the phone number shown here is correct',
    detailsBulletSignal: 'you have mobile phone signal',
    detailsRequestNewCodePrefix:
      "If you still don't have the text message, you can",
    detailsRequestNewCodeLinkText: 'request a new activation code',
    continueButton: 'Continue',
    developerHint: 'Developer hint: code is {code}',
    errors: {
      waitFiveMinutes:
        'Wait 5 minutes, then get a new code using the link on this page',
      superseded:
        'This code is no longer valid. A newer code has been sent. Please use the most recent code',
      expired:
        'This code has expired. Get a new code using the link on this page',
      enterCodeShown:
        'Enter the 5 digit activation code shown in the text message',
      enterCode: 'Enter your 5 digit activation code',
      enterCodeExample: 'Enter your 5 digit activation code, like 01234'
    }
  },
  // Email confirm link callback page
  emailConfirmLink: {
    errorPageTitle:
      'There is a problem - Check your email - Check air quality - GOV.UK',
    errorHeading: 'There is a problem with your activation link',
    errorMissingToken:
      'The activation link is missing or incomplete. Please request a new one.',
    errorInvalidToken:
      'This activation link is invalid or has expired. Please request a new one.',
    errorSetupAlert:
      'We could not finish setting up your alert. Please request a new activation link.',
    requestNewLinkText: 'Request a new activation link',
    changeEmailLinkText: 'Use a different email address'
  },
  // Email verify email page
  emailVerifyEmail: {
    pageTitle: 'Check your email',
    heading: 'Check your email',
    sentLinkText: "We've sent an activation link to {emailAddress}.",
    confirmLinkText:
      'Use the link in the email to confirm you want to get email notifications about air pollution in {location}.',
    detailsSummary: 'Not received an email?',
    detailsIntro:
      'Emails sometimes take a few minutes to arrive. Check your spam or junk folder if it has not arrived.',
    detailsBulletEmail: 'the email address shown here is correct',
    detailsBulletSpam: 'it has not been filtered into your spam or junk folder',
    requestNewLinkText: 'Request a new activation link',
    setupTextMessageLinkText: 'Set up a text message alert instead'
  },
  // SMS send new code page
  smsSendNewCode: {
    pageTitle: 'Request a new activation code',
    heading: 'Request a new activation code',
    intro1: 'Text messages can take a few minutes to arrive.',
    intro2:
      'If the activation code has not arrived after 10 minutes, you can get a new code sent to:',
    bulletSameNumber:
      'the same mobile phone number, <strong>{mobileNumber}</strong>',
    bulletDifferentNumber: 'a different mobile phone number',
    detailsSummary: 'Send the text to a different number',
    detailsLabel: 'Enter mobile phone number (optional)',
    detailsHint:
      'Enter a UK mobile phone number, like <strong>07700 900 982</strong>',
    submitButton: 'Request a new code'
  },
  // SMS duplicate page
  smsDuplicate: {
    pageTitle: 'This alert has already been set up',
    heading: 'This alert has already been set up',
    description:
      'You are already getting alerts for {location} to {mobileNumber}.',
    searchLinkText: 'Search for town or postcode',
    searchText: 'to set up a different air pollution alert.'
  },
  // Email duplicate page
  emailDuplicate: {
    pageTitle: 'This alert has already been set up',
    heading: 'This alert has already been set up',
    description:
      'You are already getting alerts for {location} to {emailAddress}.',
    searchLinkText: 'Search for town or postcode',
    searchText: 'to set up a different air pollution alert.'
  },
  // SMS success page
  smsSuccess: {
    pageTitle: 'You have successfully signed up for air quality alerts',
    heading: 'You have successfully signed up for air quality alerts',
    successTitle: 'Success',
    bannerHeading: 'You have set up air pollution alerts for {location}',
    confirmationText: 'We have sent you a confirmation text message.',
    anotherAlertPrefix:
      'If you want to set up another alert for {mobileNumber} you can',
    anotherAlertLinkText: 'search for another location',
    anotherAlertSuffix: '.',
    researchHeading: 'Help improve this service',
    researchSignupPrefix:
      'This is a new service and we are looking for people to share their feedback with us.',
    researchSignupLinkText:
      'Sign up to participate in future research and help improve this service',
    researchSignupSuffix: '.',
    researchPrivacyPrefix: 'By signing up, you agree to our ',
    researchPrivacyLinkText: 'privacy statement',
    researchPrivacySuffix:
      ' and consent to being contacted for research purposes.',
    researchRadioLegend: 'Would you like to help improve this service?',
    researchRadioHint: 'Select one option',
    researchOptionYes: 'Yes',
    researchOptionNo: 'No',
    researchContinueButton: 'Continue'
  },
  // Email details page errors
  emailDetails: {
    alertLimitHint: 'You can add up to 5 alerts for each email address.',
    errors: {
      maxAlertsReached: {
        summary:
          'You have already added the maximum of 5 alerts for {email}. Enter a different email address.',
        field: 'Enter a different email address.'
      }
    }
  },
  // Email alerts success page
  emailSuccess: {
    pageTitle: 'You have successfully signed up for air quality alerts',
    heading: 'You have successfully signed up for air quality alerts',
    successTitle: 'Success',
    bannerHeading: 'You have set up air quality email alerts for {location}',
    confirmationText: 'We have sent you a confirmation email.',
    anotherAlertPrefix:
      'If you want to set up another alert for {emailAddress} you can',
    anotherAlertLinkText: 'search for another location',
    anotherAlertSuffix: '.',
    researchHeading: 'Help improve this service',
    researchSignupPrefix:
      'This is a new service and we are looking for people to share their feedback with us.',
    researchSignupLinkText:
      'Sign up to participate in future research and help improve this service',
    researchSignupSuffix: '.',
    researchPrivacyPrefix: 'By signing up, you agree to our ',
    researchPrivacyLinkText: 'privacy statement',
    researchPrivacySuffix:
      ' and consent to being contacted for research purposes.'
  },
  // Activation code page (legacy SMS journey)
  activationCode: {
    codeExpiry: 'The code expires in 24 hours.',
    notReceivedSummary: 'Not received a text message?',
    notReceivedDelay: 'Text messages sometimes take a few minutes to arrive.',
    notReceivedCheckPrefix:
      'If you do not receive a text message after 10 minutes, check that you have:',
    notReceivedBullet1: 'entered your number correctly',
    notReceivedBullet2: 'mobile phone signal',
    continueButton: 'Continue',
    sendNewCode: 'Send a new activation code'
  },
  // Confirm alert page (legacy SMS journey)
  confirmAlert: {
    bullet1: 'when the air quality forecast in {location} is high or very high',
    bullet2:
      'if a nearby monitoring site detects high or very high pollution levels anywhere in the Greater London region',
    continueButton: 'Continue'
  }
}
