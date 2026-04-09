/**
 * Welsh translations for SMS notification journey
 * Covers mobile number input, code verification, and confirmation pages
 */
// ''
const TODO_CONTINUE = 'TODO Welsh: Continue'
const TODO_REQUEST_NEW_ACTIVATION_LINK =
  'TODO Welsh: Request a new activation link'
const TODO_SEARCH_ANOTHER_LOCATION = 'TODO Welsh: search for another location'
const TODO_ALERT_ALREADY_SET_UP =
  'TODO Welsh: This alert has already been set up'
const TODO_ALERT_SIGNUP_SUCCESS =
  'TODO Welsh: You have successfully signed up for air quality alerts'

export const notificationTranslationsWelsh = {
  // Common notification settings
  common: {
    serviceName: 'Check air quality',
    textAlertsPage: 'TODO Welsh: Text alerts',
    emailAlertsPage: 'TODO Welsh: Email alerts',
    errorSummaryTitle: 'TODO Welsh: There is a problem',
    backLinkText: 'TODO Welsh: Back'
  },
  // SMS Mobile Phone Number Entry page
  smsMobilePhone: {
    pageTitle: 'TODO Welsh: What is your mobile phone number?',
    heading: 'TODO Welsh: What is your mobile phone number?',
    description:
      'TODO Welsh: We will send you a text message with a 5-digit activation code.',
    inputLabel: 'TODO Welsh: Enter your mobile phone number',
    continueButton: TODO_CONTINUE,
    alertLimitHint:
      'TODO Welsh: You can add up to 5 alerts for each mobile phone number.',
    errors: {
      empty: 'TODO Welsh: Enter your mobile phone number',
      format: 'TODO Welsh: Enter a UK mobile phone number, like 07700 900 982'
    }
  },
  // SMS Confirm Details page
  smsConfirmDetails: {
    pageTitle: 'Cadarnhau eich bod am sefydlu rhybudd',
    heading: 'Cadarnhau eich bod am sefydlu rhybudd ar gyfer {location}',
    description: "Rydych chi'n sefydlu rhybudd i gael eich hysbysu:",
    alertTypes: {
      forecast:
        "pan fydd y rhagolwg ansawdd aer yn {location} yn uchel neu'n uchel iawn",
      monitoring:
        'TODO Welsh: if a monitoring site measures high or very high pollution levels in this area'
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
    continueButton: 'TODO Welsh: Confirm and set up alert',
    errors: {
      required: 'Dewiswch ie os ydych chi am dderbyn rhybuddion ansawdd aer',
      duplicateAlert: {
        summary:
          'TODO Welsh: You have already set up an alert for {location}. Choose a different location or mobile phone number.',
        field:
          'TODO Welsh: Select yes if you want to receive air quality alerts for a different location'
      }
    }
  },
  // SMS Mobile Number page errors
  smsMobileNumber: {
    errors: {
      maxAlertsReached: {
        summary:
          'TODO Welsh: You have already added the maximum of 5 alerts for {phoneNumber}. Enter a different UK phone number.',
        field: 'TODO Welsh: Enter a UK mobile phone number, like 07700 900 982'
      }
    }
  },
  // SMS send activation page
  smsSendActivation: {
    pageTitle: 'TODO Welsh: We are going to send you an activation code',
    heading: 'TODO Welsh: We are going to send you an activation code',
    bodyText:
      'TODO Welsh: We will send a text message to {mobileNumber} with a 5-digit activation code.',
    continueButton: 'TODO Welsh: Agree and continue',
    changeNumberLinkText: 'TODO Welsh: I want to use a different mobile number'
  },
  // SMS verify code page
  smsVerifyCode: {
    pageTitle: 'TODO Welsh: Check your mobile phone',
    errorPageTitle: 'TODO Welsh: Error: Check your mobile phone',
    heading: 'TODO Welsh: Check your mobile phone',
    bodyText:
      "TODO Welsh: We've sent a text message to {mobileNumber} with a 5 digit activation code.",
    label: 'TODO Welsh: Enter the code to activate your air pollution alert.',
    codeExpiryText: 'TODO Welsh: The code expires in 15 minutes.',
    detailsSummary: 'TODO Welsh: Not received a text message?',
    detailsIntro:
      'TODO Welsh: Text messages sometimes take a few minutes to arrive.',
    detailsChecklistIntro:
      'TODO Welsh: If you have not received the text message after 10 minutes, check that:',
    detailsBulletNumber: 'TODO Welsh: the phone number shown here is correct',
    detailsBulletSignal: 'TODO Welsh: you have mobile phone signal',
    detailsRequestNewCodePrefix:
      "TODO Welsh: If you still don't have the text message, you can",
    detailsRequestNewCodeLinkText: 'TODO Welsh: request a new activation code',
    continueButton: TODO_CONTINUE,
    developerHint: 'TODO Welsh: Developer hint: code is {code}',
    errors: {
      waitFiveMinutes:
        'TODO Welsh: Wait 5 minutes, then get a new code using the link on this page',
      superseded:
        'TODO Welsh: This code is no longer valid. A newer code has been sent. Please use the most recent code',
      expired:
        'TODO Welsh: This code has expired. Get a new code using the link on this page',
      enterCodeShown:
        'TODO Welsh: Enter the 5 digit activation code shown in the text message',
      enterCode: 'TODO Welsh: Enter your 5 digit activation code',
      enterCodeExample:
        'TODO Welsh: Enter your 5 digit activation code, like 01234'
    }
  },
  // Email confirm link callback page
  emailConfirmLink: {
    errorPageTitle:
      'TODO Welsh: This activation link has expired - Check air quality - GOV.UK',
    errorHeading: 'TODO Welsh: This activation link has expired',
    errorExpiredBody:
      'TODO Welsh: Activation links stop working after 15 minutes.',
    errorSearchLinkText: 'TODO Welsh: Search for a town or postcode',
    errorSearchLinkSuffix: 'TODO Welsh: to set up an air pollution alert.',
    errorMissingToken:
      'TODO Welsh: The activation link is missing or incomplete. Please request a new one.',
    errorInvalidToken:
      'TODO Welsh: This activation link is invalid or has expired. Please request a new one.',
    errorSetupAlert:
      'TODO Welsh: We could not finish setting up your alert. Please request a new activation link.',
    requestNewLinkText: TODO_REQUEST_NEW_ACTIVATION_LINK,
    changeEmailLinkText: 'TODO Welsh: Use a different email address'
  },
  // Email verify email page
  emailVerifyEmail: {
    pageTitle: 'TODO Welsh: Check your email',
    heading: 'TODO Welsh: Check your email',
    sentLinkText:
      "TODO Welsh: We've sent an activation link to {emailAddress}.",
    confirmLinkText:
      'TODO Welsh: Use the link in the email to confirm you want to get email notifications about air pollution in {location}.',
    detailsSummary: 'TODO Welsh: Not received an email?',
    detailsIntro: 'TODO Welsh: Emails sometimes take a few minutes to arrive.',
    detailsIfNotReceived:
      'TODO Welsh: If you do not receive an email after 10 minutes:',
    detailsBulletSpam:
      'TODO Welsh: check that the email is not in your spam or junk folder',
    detailsBulletEmail:
      'TODO Welsh: confirm that the email address shown here is correct',
    detailsBulletInternet:
      'TODO Welsh: check you are connected to the internet',
    requestNewLinkPrefix: 'TODO Welsh: You can',
    requestNewLinkText: 'TODO Welsh: request a new activation link',
    requestNewLinkSuffix:
      'TODO Welsh: to the same email address, or to a different email address.',
    smsLinkPrefix: 'TODO Welsh: Or you can',
    setupTextMessageLinkText:
      'TODO Welsh: set up text message alerts using a mobile phone number',
    smsLinkSuffix: 'TODO Welsh: instead.'
  },
  // Email send new link page
  emailSendNewLink: {
    pageTitle: TODO_REQUEST_NEW_ACTIVATION_LINK,
    heading: TODO_REQUEST_NEW_ACTIVATION_LINK,
    intro1: 'TODO Welsh: Emails can take a few minutes to arrive.',
    intro2:
      'TODO Welsh: If the activation link has not arrived after 10 minutes, you can get a new link sent to:',
    bulletSameEmail:
      'TODO Welsh: the same email address, <strong>{emailAddress}</strong>',
    bulletDifferentEmail: 'TODO Welsh: a different email address',
    detailsSummary: 'TODO Welsh: Send the link to a different email address',
    detailsLabel: 'TODO Welsh: Enter email address (optional)',
    submitButton: 'TODO Welsh: Request a new link',
    errors: {
      format:
        'TODO Welsh: Enter an email address in the correct format, like name@example.com'
    }
  },
  // SMS send new code page
  smsSendNewCode: {
    pageTitle: 'TODO Welsh: Request a new activation code',
    heading: 'TODO Welsh: Request a new activation code',
    intro1: 'TODO Welsh: Text messages can take a few minutes to arrive.',
    intro2:
      'TODO Welsh: If the activation code has not arrived after 10 minutes, you can get a new code sent to:',
    bulletSameNumber:
      'TODO Welsh: the same mobile phone number, <strong>{mobileNumber}</strong>',
    bulletDifferentNumber: 'TODO Welsh: a different mobile phone number',
    detailsSummary: 'TODO Welsh: Send the text to a different number',
    detailsLabel: 'TODO Welsh: Enter mobile phone number (optional)',
    submitButton: 'TODO Welsh: Request a new code'
  },
  // SMS duplicate page
  smsDuplicate: {
    pageTitle: TODO_ALERT_ALREADY_SET_UP,
    heading: TODO_ALERT_ALREADY_SET_UP,
    description:
      'TODO Welsh: You are already getting alerts for {location} to {mobileNumber}.',
    searchLinkText: 'TODO Welsh: Search for town or postcode',
    searchText: 'TODO Welsh: to set up a different air pollution alert.'
  },
  // SMS max alerts page
  smsMaxAlerts: {
    pageTitle: 'TODO Welsh: You have added the maximum number of alerts',
    heading: 'TODO Welsh: You have added the maximum number of alerts',
    limitText: 'TODO Welsh: You can add up to 5 alerts for each email address.',
    intro: 'TODO Welsh: To add an alert for this location you can either:',
    differentEmailLinkText:
      'TODO Welsh: add an alert for a different email address',
    unsubscribeLinkText:
      'TODO Welsh: unsubscribe from all alerts for this email address'
  },
  // Email duplicate page
  emailDuplicate: {
    pageTitle: TODO_ALERT_ALREADY_SET_UP,
    heading: TODO_ALERT_ALREADY_SET_UP,
    description:
      'TODO Welsh: You are already getting alerts for {location} to {emailAddress}.',
    searchLinkText: 'TODO Welsh: Search for town or postcode',
    searchText: 'TODO Welsh: to set up a different air pollution alert.'
  },
  // SMS success page
  smsSuccess: {
    pageTitle: TODO_ALERT_SIGNUP_SUCCESS,
    heading: TODO_ALERT_SIGNUP_SUCCESS,
    successTitle: 'TODO Welsh: Success',
    bannerHeading: 'this is a dummy text unti tranalation ready',
    confirmationText:
      'TODO Welsh: We have sent you a confirmation text message.',
    anotherAlertPrefix:
      'TODO Welsh: If you want to set up another alert for {mobileNumber} you can',
    anotherAlertLinkText: TODO_SEARCH_ANOTHER_LOCATION,
    anotherAlertSuffix: '.',
    researchHeading: 'TODO Welsh: Help improve this service',
    researchSignupPrefix:
      'TODO Welsh: This is a new service and we are looking for people to share their feedback with us.',
    researchSignupLinkText:
      'TODO Welsh: Sign up to participate in future research and help improve this service',
    researchSignupSuffix: '.',
    researchPrivacyPrefix: 'TODO Welsh: By signing up, you agree to our ',
    researchPrivacyLinkText: 'TODO Welsh: privacy statement',
    researchPrivacySuffix:
      'TODO Welsh: and consent to being contacted for research purposes.',
    researchRadioLegend:
      'TODO Welsh: Would you like to help improve this service?',
    researchRadioHint: 'TODO Welsh: Select one option',
    researchOptionYes: 'TODO Welsh: Yes',
    researchOptionNo: 'TODO Welsh: No',
    researchContinueButton: TODO_CONTINUE
  },
  // Email details page errors
  emailDetails: {
    alertLimitHint:
      'TODO Welsh: You can add up to 5 alerts for each email address.',
    errors: {
      sendFailure:
        'TODO Welsh: We could not send the email right now. Try again in a moment.',
      maxAlertsReached: {
        summary:
          'TODO Welsh: You have already added the maximum of 5 alerts for {email}. Enter a different email address.',
        field: 'TODO Welsh: Enter a different email address.'
      }
    }
  },
  // Email alerts success page
  emailSuccess: {
    pageTitle: TODO_ALERT_SIGNUP_SUCCESS,
    heading: TODO_ALERT_SIGNUP_SUCCESS,
    successTitle: 'TODO Welsh: Success',
    bannerHeading:
      'TODO Welsh: You have set up air quality email alerts for {location}',
    confirmationText: 'TODO Welsh: We have sent you a confirmation email.',
    anotherAlertPrefix:
      'TODO Welsh: If you want to set up another alert for {emailAddress} you can',
    anotherAlertLinkText: TODO_SEARCH_ANOTHER_LOCATION,
    anotherAlertSuffix: '.',
    researchHeading: 'TODO Welsh: Help improve this service',
    researchSignupPrefix:
      'TODO Welsh: This is a new service and we are looking for people to share their feedback with us.',
    researchSignupLinkText:
      'TODO Welsh: Sign up to participate in future research and help improve this service',
    researchSignupSuffix: '.',
    researchPrivacyPrefix: 'TODO Welsh: By signing up, you agree to our ',
    researchPrivacyLinkText: 'TODO Welsh: privacy statement',
    researchPrivacySuffix:
      'TODO Welsh: and consent to being contacted for research purposes.'
  },
  // Activation code page (legacy SMS journey)
  activationCode: {
    pageTitle: 'TODO Welsh: Enter your activation code',
    heading: 'TODO Welsh: Enter your activation code',
    codeExpiry: 'TODO Welsh: The code expires in 24 hours.',
    notReceivedSummary: 'TODO Welsh: Not received a text message?',
    notReceivedDelay:
      'TODO Welsh: Text messages sometimes take a few minutes to arrive.',
    notReceivedCheckPrefix:
      'TODO Welsh: If you do not receive a text message after 10 minutes, check that you have:',
    notReceivedBullet1: 'TODO Welsh: entered your number correctly',
    notReceivedBullet2: 'TODO Welsh: mobile phone signal',
    continueButton: TODO_CONTINUE,
    sendNewCode: 'TODO Welsh: Send a new activation code'
  },
  // Confirm alert page (legacy SMS journey)
  confirmAlert: {
    bullet1:
      'TODO Welsh: when the air quality forecast in {location} is high or very high',
    bullet2:
      'TODO Welsh: if a nearby monitoring site detects high or very high pollution levels anywhere in the Greater London region',
    continueButton: TODO_CONTINUE
  },
  // Unsubscribe email link page
  unsubscribeEmailLink: {
    heading: 'TODO Welsh: Confirm you want to unsubscribe',
    bodyText:
      'TODO Welsh: Do you want to stop getting air pollution alerts by email?',
    confirmButton: 'TODO Welsh: Yes, unsubscribe',
    cancelLink: 'TODO Welsh: No, keep email alerts'
  },
  // Unsubscribe success page
  unsubscribeSuccess: {
    heading:
      'TODO Welsh: You have unsubscribed from air pollution alerts by email',
    bodyPrefix: 'TODO Welsh: If you want to set up an alert, you can ',
    searchLinkText: TODO_SEARCH_ANOTHER_LOCATION,
    bodySuffix: '.'
  },
  // Unsubscribe keep alerts page
  unsubscribeKeepAlerts: {
    heading:
      'TODO Welsh: You will continue to get air pollution alerts by email',
    bodyPrefix: 'TODO Welsh: If you want to set up another alert, you can ',
    searchLinkText: TODO_SEARCH_ANOTHER_LOCATION,
    bodySuffix: '.'
  }
}
