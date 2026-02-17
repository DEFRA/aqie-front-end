/**
 * Welsh translations for SMS notification journey
 * Covers mobile number input, code verification, and confirmation pages
 */
// ''
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
    continueButton: 'TODO Welsh: Continue',
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
    continueButton: 'TODO Welsh: Continue',
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
  // SMS send new code page
  smsSendNewCode: {
    pageTitle: 'TODO Welsh: Request a new activation code',
    heading: 'TODO Welsh: Request a new activation code',
    intro1: 'TODO Welsh: Text messages can take a few minutes to arrive.',
    intro2:
      'TODO Welsh: If the activation code has not arrived after 10 minutes, you can get a new code sent to:',
    bulletSameNumber:
      'TODO Welsh: the same mobile phone number, {mobileNumber}',
    bulletDifferentNumber: 'TODO Welsh: a different mobile phone number',
    detailsSummary: 'TODO Welsh: Send the text to a different number',
    detailsLabel: 'TODO Welsh: Enter mobile phone number (optional)',
    detailsHint:
      'TODO Welsh: Enter a UK mobile phone number, like 07700 900 982',
    submitButton: 'TODO Welsh: Request a new code'
  },
  // SMS duplicate page
  smsDuplicate: {
    pageTitle: 'TODO Welsh: This alert has already been set up',
    heading: 'TODO Welsh: This alert has already been set up',
    description:
      'TODO Welsh: You are already getting alerts for {location} to {mobileNumber}.',
    searchLinkText: 'TODO Welsh: Search for town or postcode',
    searchText: 'TODO Welsh: to set up a different air pollution alert.'
  },
  // SMS success page
  smsSuccess: {
    pageTitle:
      'TODO Welsh: You have successfully signed up for air quality alerts',
    heading:
      'TODO Welsh: You have successfully signed up for air quality alerts',
    successTitle: 'TODO Welsh: Success',
    bannerHeading: 'this is a dummy text unti tranalation ready',
    confirmationText:
      'TODO Welsh: We have sent you a confirmation text message.',
    anotherAlertPrefix:
      'TODO Welsh: If you want to set up another alert for {mobileNumber} you can',
    anotherAlertLinkText: 'TODO Welsh: search for another location',
    anotherAlertSuffix: '.',
    researchHeading: 'TODO Welsh: Help us make our service better',
    researchSignupPrefix:
      'TODO Welsh: This is a new service and we are looking for people to share their feedback with us.',
    researchSignupLinkText:
      'TODO Welsh: Sign up to participate in future research and help improve this service',
    researchSignupSuffix: '.',
    researchPrivacyPrefix: 'TODO Welsh: By signing up, you agree to our ',
    researchPrivacyLinkText: 'TODO Welsh: privacy statement',
    researchPrivacySuffix:
      'TODO Welsh: and consent to being contacted for research purposes.'
  }
}
