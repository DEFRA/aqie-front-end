''
const SERVICE_NAME = 'Check air quality'

/**
 * English translations for footer, cookies, privacy, and UI components
 */
export const uiTranslations = {
  cookieBanner: {
    title: `Cookies on ${SERVICE_NAME}`,
    paragraphs: {
      a: 'We use some essential cookies to make this service work.',
      b: "We'd also like to use analytics cookies so we can understand how you use the service and make improvements."
    },
    buttons: {
      a: 'Accept analytics cookies',
      b: 'Reject analytics cookies',
      c: 'View cookies'
    },
    hideCookieMsg: {
      text0: "You've accepted analytics cookies. You can ",
      text1: "You've rejected analytics cookies. You can",
      text2: 'change your cookie settings',
      text3: ' at any time.',
      buttonText: 'Hide cookie message'
    }
  },
  footerTxt: {
    cookies: 'Cookies',
    privacy: 'Privacy',
    accessibility: 'Accessibility statement',
    paragraphs: {
      a: 'All content is available under the',
      b: 'Open Government Licence v3.0, ',
      c: 'except where otherwise stated',
      d: 'Crown copyright'
    }
  }
}

export const footerTranslations = {
  footer: {
    privacy: {
      pageTitle: `Privacy - ${SERVICE_NAME} - GOV.UK`,
      title: `${SERVICE_NAME} privacy notice`,
      heading: SERVICE_NAME,
      headings: {
        a: 'Who collects your personal data',
        b: 'What personal data we collect and how it is used',
        c: 'Lawful basis for processing your personal data',
        d: 'Consent to process your personal data',
        e: 'Who we share your personal data with',
        f: 'How long we hold personal data',
        g: 'What happens if you do not provide the personal data',
        h: 'Use of automated decision-making or profiling',
        i: 'Transfer of your personal data outside of the UK',
        j: 'Your rights',
        k: 'Complaints',
        l: 'Personal information charter'
      },
      paragraphs: {
        a: `This privacy notice explains how the ${SERVICE_NAME} service processes and shares your personal data. If you have any queries about the content of this privacy notice, please email`,
        b: 'Department for Environment, Food and Rural Affairs (Defra) is the controller for the personal data we collect:',
        c: 'Department for Environment, Food and Rural Affairs',
        d: 'Seacole Building',
        e: '2 Marsham Street',
        f: 'London',
        g: 'SW1P 4DF',
        h: 'If you need further information about how Defra uses your personal data and your associated rights you can contact the Defra data protection manager at ',
        i: 'or at the above address.',
        j: 'The data protection officer for Defra is responsible for checking that Defra complies with legislation. You can contact them at',
        k0: 'For the service to be functional, we collect the postcode or placename that you search for as this is essential data for the service to give relevant data.',
        k: 'If you accept the Google analytical cookies, then we will collect:',
        l: 'your IP address so that we can collect location information of users to our service. This will help us see what geographical locations are using our service. ',
        m: 'your device and operating system to enable us to improve our service',
        n: `the search term you used to find ${SERVICE_NAME} to enable us to improve our service`,
        o: `the pages you interact with in ${SERVICE_NAME} to enable us to improve our service`,
        q: 'The legal basis for processing your personal data to conduct research on the effectiveness of the service is consent. You do not have to provide your consent and you can withdraw your consent at any time.',
        r: 'The processing of your personal data is based on consent. We do not collect any information that could be personally linked to an individual; however, the IP address will be recorded for functionality of the service.',
        r2: 'If you have consented to accepting cookies, any information that we collect during this process cannot be removed as we will be unable to identify that information to a specific individual.',
        s: 'We do not share the personal data collected under this privacy notice with other organisations.',
        t: 'We respect your personal privacy when responding to access to information requests. We only share information when necessary to meet the statutory requirements of the Environmental Information Regulations 2004 and the Freedom of Information Act 2000.',
        u: 'We will keep your personal data for 7 years in line with legislative requirements which is 7 years.',
        w: 'for advice on retention period that you need to state here.',
        x: 'If you do not provide the personal data of the postcode or location that you are searching for, then you will not be able to use our service as we will not be able to provide you any data.',
        y: 'The other personal data is optional and only required for service improvement.',
        z: 'The personal data you provide is not used for:',
        a0: 'automated decision making (making a decision by automated means without any human involvement)',
        a1: 'profiling (automated processing of personal data to evaluate certain things about an individual)',
        a2: 'We will only transfer your personal data to another country that is deemed adequate for data protection purposes.',
        a3: 'Based on the lawful processing above, your individual rights are:',
        a4: 'Consent',
        a5: 'The right to be informed',
        a6: 'The right of access',
        a7: 'The right to rectification',
        a8: 'The right to erasure',
        a9: 'The right to restrict processing',
        a10: 'The right to data portability',
        a11: 'Rights in relation to automated decision making and profiling',
        a12: 'More information about your',
        a13: 'individual rights',
        a14: 'under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018 (DPA 2018),',
        a15: "can be found at the Information Commissioner's Office",
        a16: 'You have the right to',
        a17: 'make a complaint',
        a18: "to the Information Commissioner's Office at any time.",
        a19: 'Personal information charter',
        a20: 'Our',
        a21: 'personal information charter',
        a22: 'explains more about your rights over your personal data.',
        a23: 'You can',
        a24: 'opt in and out of cookie acceptance.'
      },
      description: `${SERVICE_NAME} takes your privacy seriously. Read this Privacy Policy to learn how we treat your personal data.`
    },
    cookies: {
      title: 'Cookies',
      pageTitle: `Cookies - ${SERVICE_NAME} - GOV.UK`,
      headings: {
        a: 'Essential cookies (strictly necessary)',
        b: 'Analytics cookies (optional)',
        c: 'Analytics cookies we use',
        d: 'Do you want to accept analytics cookies?'
      },
      table1: {
        title: 'Essential cookies we use',
        text1: 'Name',
        text2: 'Purpose',
        text3: 'Expires',
        text4: 'airaqie_cookies_analytics',
        text5: 'Saves your cookie consent settings',
        text6: '1 year'
      },
      table2: {
        text1: 'Name',
        text2: 'Purpose',
        text3: 'Expires',
        text4: `Helps us count how many people visit the ${SERVICE_NAME} by telling us if you've visited before.`,
        text5: '2 years',
        text6: '_gid',
        text7: `Helps us count how many people visit the ${SERVICE_NAME} by telling us if you've visited before.`,
        text8: '24 hours',
        text9: 'Used to reduce the number of requests.',
        text10: '1 minute',
        text11:
          'Application related data is managed in this cookie and it is required for application functionality to work',
        text12: '30 minutes'
      },
      paragraphs: {
        w: '',
        a: `${SERVICE_NAME}`,
        b: "puts small files (known as 'cookies') on your computer.",
        c: `These cookies are used across the ${SERVICE_NAME} website.`,
        d: "We only set cookies when JavaScript is running in your browser and you've accepted them. If you choose not to run Javascript, the information on this page will not apply to you.",
        e: 'Find out',
        f: 'how to manage cookies',
        g: "from the Information Commissioner's Office.",
        h: 'We use an essential cookie to remember when you accept or reject cookies on our website.',
        i: `We use Google Analytics software to understand how people use the ${SERVICE_NAME}. We do this to help make sure the site is meeting the needs of its users and to help us make improvements.`,
        j: 'We do not collect or store your personal information (for example your name or address) so this information cannot be used to identify who you are.',
        k: 'We do not allow Google to use or share our analytics data.',
        l: 'Google Analytics stores information about:',
        m: 'the pages you visit',
        n: 'how long you spend on each page',
        o: 'how you arrived at the site',
        p: 'what you click on while you visit the site',
        q: 'the device and browser you use',
        r: 'Yes',
        s: 'No',
        buttonText: 'Save cookie settings',
        ga1: 'The cookies',
        ga2: '_ga_',
        ga3: '_gat_UA-[G-8CMZBTDQBC]',
        ga4: 'and',
        ga5: 'will only be active if you accept the cookies. However, if you do not accept cookies, they may still appear in your cookie session, but they will not be active.'
      },
      description: `${SERVICE_NAME} uses cookies. By using this service you agree to our use of cookies.`
    },
    accessibility: {
      title: 'Accessibility Statement',
      pageTitle: `Accessibility Statement - ${SERVICE_NAME} - GOV.UK`,
      headings: {
        a: 'Compliance status',
        b: 'Preparation of this accessibility statement',
        c: 'Feedback and contact information',
        d: 'Enforcement procedure'
      },
      paragraphs: {
        a: 'Department for Environment, Food & Rural Affairs is committed to making its websites accessible in accordance with the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018.',
        b: 'This accessibility statement applies to',
        c: 'This website is fully compliant with the Web Content Accessibility Guidelines (WCAG) version 2.2 AA standard.',
        d: 'This statement was prepared on 18 September 2024.',
        e: 'The website was evaluated by the Department for Environment, Food & Rural Affairs.',
        f: 'The statement was last reviewed on 16 September 2024.',
        g: 'If you notice any compliance failures or need to request information and content that is not provided in this document, please email',
        h: "The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (the 'accessibility regulations').",
        i: "If you're not happy with how we respond to your complaint, contact the Equality Advisory and Support Service (EASS)."
      },
      description: `${SERVICE_NAME} is committed to improving accessibility for all web, mobile, and app users, guided by the latest Web Content Accessibility Guidelines (WCAG).`
    }
  }
}
