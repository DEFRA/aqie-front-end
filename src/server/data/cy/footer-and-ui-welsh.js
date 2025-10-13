// Welsh translations module for footer, UI components, privacy policy, cookies policy, and accessibility statement
import { WELSH_TITLE } from '../constants.js'

const WELSH_SERVICE_NAME = 'Gwirio ansawdd aer'
const GOVUK_SUFFIX = ' - GOV.UK'

// Common Welsh cookies and privacy text patterns
const WELSH_COOKIES_TEXT = 'Cwcis'
const WELSH_PRIVACY_TEXT = 'Preifatrwydd'

/**
 * Welsh translations for footer, cookies, privacy, and UI components
 */
export const uiTranslationsWelsh = {
  cookieBanner: {
    title: `${WELSH_COOKIES_TEXT} ar ${WELSH_SERVICE_NAME}`,
    paragraphs: {
      a: "Rydym yn defnyddio rhai cwcis hanfodol i wneud i'r gwasanaeth hwn weithio.",
      b: "Hoffem hefyd ddefnyddio cwcis dadansoddol fel y gallwn ddeall sut rydych yn defnyddio'r gwasanaeth a gwneud gwelliannau."
    },
    buttons: {
      a: 'Derbyn cwcis dadansoddol',
      b: 'Gwrthod cwcis dadansoddol',
      c: 'Gweld cwcis'
    },
    hideCookieMsg: {
      text0: 'Rydych chi wedi derbyn cwcis dadansoddol. Gallwch newid ',
      text1: 'Rydych chi wedi gwrthod cwcis dadansoddol. Gallwch newid ',
      text2: 'eich gosodiadau cwci ',
      text3: ' ar unrhyw adeg.',
      buttonText: 'Cuddio neges cwci'
    }
  },
  footerTxt: {
    cookies: WELSH_COOKIES_TEXT,
    privacy: WELSH_PRIVACY_TEXT,
    accessibility: 'Datganiad hygyrchedd',
    paragraphs: {
      a: "Mae'r holl gynnwys ar gael o dan y",
      b: 'Drwydded Llywodraeth Agored v3.0',
      c: 'ac eithrio lle nodir yn wahanol',
      d: 'Hawlfraint y Goron'
    }
  }
}

export const footerTranslationsWelsh = {
  footer: {
    privacy: {
      pageTitle: `${WELSH_PRIVACY_TEXT} - ${WELSH_SERVICE_NAME}${GOVUK_SUFFIX}`,
      title: `Hysbysiad preifatrwydd ${WELSH_SERVICE_NAME}`,
      heading: WELSH_SERVICE_NAME,
      headings: {
        a: "Pwy sy'n casglu'ch data personol",
        b: "Pa ddata personol rydyn ni'n ei gasglu a sut mae'n cael ei ddefnyddio",
        c: "Y sail gyfreithlon dros brosesu'ch data personol",
        d: "Cydsyniad i brosesu'ch data personol",
        e: "Gyda phwy rydyn ni'n rhannu'ch data personol",
        f: "Pa mor hir rydyn ni'n cadw data personol",
        g: "Beth sy'n digwydd os na fyddwch chi'n darparu'r data personol ",
        h: 'Defnyddio penderfyniadau awtomataidd neu broffilio',
        i: "Trosglwyddo'ch data personol y tu allan i'r Deyrnas Unedig ",
        j: 'Eich hawliau',
        k: 'Cwynion',
        l: 'Siarter gwybodaeth bersonol'
      },
      paragraphs: {
        a: "Mae'r hysbysiad preifatrwydd yma yn esbonio sut mae'r gwasanaeth ansawdd aer lleol yn prosesu ac yn rhannu'ch data personol. Os oes gennych unrhyw ymholiadau am gynnwys yr hysbysiad preifatrwydd yma, anfonwch neges ebost at",
        b: "Adran yr Amgylchedd, Bwyd a Materion Gwledig (Defra) yw'r rheolwr ar gyfer y data personol rydyn ni'n ei gasglu:",
        c: 'Adran yr Amgylchedd, Bwyd a Materion Gwledig',
        d: 'Seacole Building',
        e: '2 Marsham Street',
        f: 'London',
        g: 'SW1P 4DF',
        h: "Os oes arnoch chi angen rhagor o wybodaeth am sut mae Defra yn defnyddio'ch data personol a'ch hawliau cysylltiedig, gallwch gysylltu â rheolwr diogelu data Defra yn ",
        i: 'neu yn y cyfeiriad uchod.',
        j: "Swyddog diogelu data Defra sy'n gyfrifol am wirio bod Defra yn cydymffurfio â'r ddeddfwriaeth. Gallwch gysylltu â nhw yn",
        k0: "Er mwyn i'r gwasanaeth fod yn weithredol, rydym yn casglu'r cod post neu'r enw lle rydych yn chwilio amdano gan fod hwn yn ddata hanfodol er mwyn i'r gwasanaeth roi data perthnasol.",
        k: 'Os byddwch yn derbyn y cwcis dadansoddol Google, yna byddwn yn casglu:',
        l: 'eich cyfeiriad IP fel y gallwn gasglu gwybodaeth am leoliad defnyddwyr ein gwasanaeth.',
        m: "Bydd hyn yn ein helpu i weld pa leoliadau daearyddol sy'n defnyddio ein gwasanaeth.",
        n: "eich dyfais a'ch system weithredu i'n galluogi i wella ein gwasanaeth y term chwilio a ddefnyddiwyd gennych i ddod o hyd i 'Gwirio ansawdd aer' i'n galluogi i wella ein gwasanaeth",
        o: "y tudalennau rydych yn rhyngweithio â nhw yn 'Gwirio ansawdd aer' i'n galluogi i wella ein gwasanaeth",
        q: "Y sail gyfreithlon dros brosesu'ch data personol er mwyn gwneud ymchwil ar effeithiolrwydd y gwasanaeth yw cydsyniad. Does dim rhaid ichi roi'ch cydsyniad a gallwch dynnu'ch cydsyniad yn ôl unrhyw bryd.",
        r: 'Mae prosesu eich data personol yn seiliedig ar ganiatâd. Nid ydym yn casglu unrhyw wybodaeth a allai fod yn gysylltiedig yn bersonol ag unigolyn; fodd bynnag, bydd y cyfeiriad IP yn cael ei gofnodi ar gyfer ymarferoldeb y gwasanaeth. ',
        r2: 'Os ydych wedi cydsynio i dderbyn cwcis, ni ellir dileu unrhyw wybodaeth a gasglwn yn ystod y broses hon gan na fyddwn yn gallu adnabod y wybodaeth honno i unigolyn penodol.',
        s: "Dydyn ni ddim yn rhannu'r data personol sy'n cael ei gasglu dan yr hysbysiad preifatrwydd yma gyda sefydliadau eraill.",
        t: "Rydyn ni'n parchu'ch preifatrwydd personol wrth ymateb i geisiadau am wybodaeth. Dim ond pan fo angen gwneud hynny er mwyn bodloni gofynion statudol Rheoliadau Gwybodaeth Amgylcheddol 2004 a Deddf Rhyddid Gwybodaeth 2000 y byddwn ni'n rhannu gwybodaeth.",
        u: "Byddwn yn cadw'ch data personol am 7 mlynedd yn unol â gofynion y ddeddfwriaeth.",
        x: "Os na fyddwch chi'n darparu data personol, sef y cod post neu'r lleoliad rydych chi'n chwilio amdano, yna fyddwch chi ddim yn gallu defnyddio'n gwasanaeth gan na fyddwn ni'n gallu darparu unrhyw ddata i chi.",
        y: "Mae'r data personol arall yn ddewisol a dim ond ar gyfer gwella gwasanaethau y mae ei angen.",
        z: "Dyw'r data personol rydych chi'n ei ddarparu ddim yn cael ei ddefnyddio ar gyfer y canlynol:",
        a0: 'gwneud penderfyniadau awtomataidd (gwneud penderfyniad drwy ddulliau awtomataidd heb unrhyw ymwneud dynol)',
        a1: 'proffilio (prosesu data personol yn awtomataidd i werthuso pethau penodol ynglŷn ag unigolyn)',
        a2: "Dim ond i wlad arall y bernir ei bod yn ddigonol at ddibenion diogelu data y byddwn ni'n trosglwyddo'ch data personol.",
        a3: 'Ar sail y prosesu cyfreithlon uchod, eich hawliau unigol chi yw:',
        a4: 'Cydsyniad',
        a5: 'Yr hawl i gael gwybod',
        a6: 'Yr hawl i weld gwybodaeth',
        a7: 'Yr hawl i gywiro',
        a8: 'Yr hawl i ddileu',
        a9: 'Yr hawl i gyfyngu ar brosesu',
        a10: 'Yr hawl i gludadwyedd data',
        a11: 'Hawliau mewn perthynas â gwneud penderfyniadau awtomataidd a phroffilio',
        a12: 'Mae rhagor o wybodaeth am eich',
        a13: 'hawliau unigol',
        a14: 'o dan Reoliad Cyffredinol y Deyrnas Unedig ar Ddiogelu Data (GDPR y DU) a Deddf Diogelu Data 2018 ar gael ar wefan',
        a15: "Swyddfa'r Comisiynydd Gwybodaeth",
        a16: 'Mae gennych chi hawl i',
        a17: 'wneud cwyn',
        a18: "i Swyddfa'r Comisiynydd Gwybodaeth unrhyw bryd.",
        a19: 'Personal information charter',
        a20: 'Mae ein',
        a21: 'siarter gwybodaeth bersonol',
        a22: 'yn esbonio rhagor am eich hawliau dros eich data personol.',
        a23: 'Gallwch ',
        a24: 'optio i mewn ac allan o dderbyn cwcis.'
      },
      description: `Mae ${WELSH_SERVICE_NAME} yn cymryd eich preifatrwydd o ddifrif. Darllenwch y Polisi Preifatrwydd yma i ddysgu sut rydyn ni'n trin eich data personol.`
    },
    cookies: {
      title: WELSH_COOKIES_TEXT,
      pageTitle: `${WELSH_COOKIES_TEXT} - ${WELSH_SERVICE_NAME}${GOVUK_SUFFIX}`,
      headings: {
        a: 'Cwcis hanfodol (cwbl angenrheidiol)',
        b: 'Cwcis dadansoddeg (dewisol)',
        c: "Cwcis dadansoddeg rydyn ni'n eu defnyddio",
        d: 'Hoffech chi dderbyn cwcis dadansoddeg?'
      },
      table1: {
        title: "Cwcis hanfodol rydyn ni'n eu defnyddio",
        text1: 'Enw',
        text2: 'Diben',
        text3: 'Yn dod i ben',
        text4: 'airaqie_cookies_analytics',
        text5: "Cadw'ch gosodiadau caniatâd cwcis",
        text6: '1 flwyddyn'
      },
      table2: {
        title: "Cwcis dadansoddeg rydyn ni'n eu defnyddio",
        text1: 'Enw',
        text2: 'Diben',
        text3: 'Yn dod i ben',
        text4: `Mae'n ein helpu i gyfrif faint o bobl sy'n ymweld â ${WELSH_SERVICE_NAME} trwy ddweud wrthon ni a ydych chi wedi ymweld o'r blaen.`,
        text5: '2 flynedd',
        text6: '_gid',
        text7: `Mae'n ein helpu i gyfrif faint o bobl sy'n ymweld â ${WELSH_SERVICE_NAME} trwy ddweud wrthon ni a ydych chi wedi ymweld o'r blaen. `,
        text8: '24 awr',
        text9: "Mae'n cael ei ddefnyddio i leihau nifer y ceisiadau.",
        text10: '1 funud',
        text11:
          "Rheolir data sy'n ymwneud â rhaglenni yn y cwci hwn ac mae'n ofynnol er mwyn i ymarferoldeb y rhaglen weithio.",
        text12: '30 munud'
      },
      paragraphs: {
        w: 'Mae',
        a: `${WELSH_TITLE}`,
        b: "yn rhoi ffeiliau bach (o'r enw 'cwcis') ar eich cyfrifiadur. ",
        c: "Mae'r cwcis yma yn cael eu defnyddio ar draws gwefan Gwirio ansawdd aer.",
        d: "Dim pan fydd JavaScript yn rhedeg yn eich porwr a phan fyddwch chi wedi'u derbyn y byddwn ni'n gosod cwcis. Os dewiswch chi beidio â rhedeg Javascript, fydd yr wybodaeth ar y dudalen yma ddim yn gymwys i chi.",
        e: 'Darganfyddwch',
        f: 'sut i reoli cwcis',
        g: "drwy Swyddfa'r Comisiynydd Gwybodaeth.",
        h: "Rydyn ni'n defnyddio cwci hanfodol i gofio pryd y byddwch chi'n derbyn neu'n gwrthod cwcis ar ein gwefan.",
        i: "Rydyn ni'n defnyddio meddalwedd Google Analytics i ddeall sut mae pobl yn defnyddio Gwirio ansawdd aer. Rydyn ni'n gwneud hyn er mwyn helpu i sicrhau bod y wefan yn ateb anghenion ei defnyddwyr ac i'n helpu i wneud gwelliannau. ",
        j: "Dydyn ni ddim yn casglu nac yn storio'ch gwybodaeth bersonol (er enghraifft eich enw neu'ch cyfeiriad) felly does dim modd defnyddio'r wybodaeth yma i wybod pwy ydych chi. ",
        k: "Dydyn ni ddim yn caniatáu i Google ddefnyddio na rhannu'n data dadansoddeg.",
        l: 'Mae Google Analytics yn cadw gwybodaeth am y canlynol:',
        m: "Y tudalennau rydych chi'n ymweld â nhw ",
        n: "Pa mor hir rydych chi'n ei dreulio ar bob tudalen",
        o: 'Sut gwnaethoch chi gyrraedd y wefan',
        p: "Beth rydych chi'n clicio arno wrth ymweld â'r wefan",
        q: "Y ddyfais a'r porwr rydych chi'n eu defnyddio",
        r: 'Hoffwn',
        s: 'Na hoffwn',
        buttonText: 'Cadw gosodiadau cwcis',
        ga1: 'Bydd y cwcis',
        ga2: '_ga_',
        ga3: '_gat_UA-[G-8CMZBTDQBC]',
        ga4: 'a',
        ga5: 'ond yn weithredol os byddwch yn derbyn y cwcis. Fodd bynnag, os nad ydych yn derbyn cwcis, efallai y byddant yn dal i ymddangos yn eich sesiwn cwci, ond ni fyddant yn weithredol.'
      },
      description:
        "Mae Gwirio ansawdd aer yn defnyddio cwcis. Drwy ddefnyddio'r gwasanaeth yma rydych chi'n cytuno i'n defnydd o gwcis."
    },
    accessibility: {
      title: 'Datganiad Hygyrchedd',
      pageTitle: 'Datganiad Hygyrchedd - Gwirio ansawdd aer - GOV.UK',
      headings: {
        a: 'Statws cydymffurfio',
        b: "Paratoi'r datganiad hygyrchedd yma ",
        c: 'Adborth a gwybodaeth gysylltu',
        d: 'Gweithdrefn orfodi'
      },
      paragraphs: {
        a: 'Mae Adran yr Amgylchedd, Bwyd a Materion Gwledig wedi ymrwymo i wneud ei gwefannau yn hygyrch yn unol â Rheoliadau Hygyrchedd Cyrff y Sector Cyhoeddus (Gwefannau a Chymwysiadau Symudol) (Rhif 2) 2018. ',
        b: "Mae'r datganiad hygyrchedd yma yn gymwys i",
        c: "Mae'r wefan yma yn cydymffurfio'n llawn â safon AA fersiwn 2.2 o Ganllawiau Hygyrchedd Cynnwys y We (WCAG).",
        d: 'Cafodd y datganiad yma ei baratoi ar 18 Medi 2024.',
        e: 'Cafodd y wefan ei gwerthuso gan Adran yr Amgylchedd, Bwyd a Materion Gwledig. ',
        f: "Y tro diwethaf i'r datganiad gael ei adolygu oedd 16 Medi 2024.",
        g: 'Os byddwch yn sylwi ar unrhyw fethiannau cydymffurfiaeth neu os oes angen ichi ofyn am wybodaeth a chynnwys sydd heb gael eu darparu yn y ddogfen yma, anfonwch neges ebost at',
        h: "Y Comisiwn Cydraddoldeb a Hawliau Dynol (EHRC) sy'n gyfrifol am orfodi Rheoliadau Hygyrchedd Cyrff y Sector Cyhoeddus (Gwefannau a Chymwysiadau Symudol) (Rhif 2) 2018 (y 'rheoliadau hygyrchedd'). ",
        i: "Os nad ydych chi'n fodlon ar y ffordd rydyn ni'n ymateb i'ch cwyn, cysylltwch â'r Gwasanaeth Cynghori a Chymorth Cydraddoldeb (EASS)."
      },
      description:
        'Mae Gwirio ansawdd aer wedi ymrwymo i wella hygyrchedd i bob defnyddiwr gwe, ffonau symudol ac ap, dan arweiniad y Canllawiau diweddaraf ar Hygyrchedd Cynnwys y We (WCAG).'
    }
  }
}

// Welsh days of the week abbreviations for dynamic tab labels
export const calendarWelshDays = [
  'Sul', // Sunday
  'Llun', // Monday
  'Maw', // Tuesday
  'Mer', // Wednesday
  'Iau', // Thursday
  'Gwe', // Friday
  'Sad' // Saturday
]
