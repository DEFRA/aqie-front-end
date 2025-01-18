import { WELSH_TITLE } from '~/src/server/data/constants'

export const welsh = {
  home: {
    pageTitle: 'Gwirio ansawdd aer - GOV.UK',
    heading: `${WELSH_TITLE}`,
    page: `${WELSH_TITLE}`,
    paragraphs: {
      a: 'Defnyddiwch y gwasanaeth yma:',
      b: 'i wirio ansawdd yr aer mewn ardal leol',
      c: 'i ddod o hyd i wybodaeth am lygryddion aer',
      d: 'dod o hyd i wybodaeth ac arweiniad iechyd'
    },
    button: 'Dechrau nawr',
    description:
      'Gwiriwch ansawdd aer eich ardal leol a’r rhagolygon llygredd aer am y 5 diwrnod nesaf. Hefyd, mynnwch gyngor iechyd i leihau’ch amlygiad i lygryddion.'
  },
  searchLocation: {
    pageTitle: 'Ble hoffech chi wirio? - Gwirio ansawdd aer  - GOV.UK',
    heading: 'Gwirio ansawdd aer ',
    page: 'search-location',
    serviceName: 'Gwirio ansawdd aer ',
    searchParams: {
      label: {
        text: 'Ble hoffech chi wirio?'
      },
      hint: {
        text1: 'Rhowch leoliad neu god post',
        text2: 'Rhowch god post'
      },
      locations: {
        a: 'Lloegr, Yr Alban, Cymru',
        b: 'Gogledd Iwerddon'
      }
    },
    button: 'Parhau',
    errorText: {
      radios: {
        title: 'Mae yna broblem',
        list: {
          text: 'Dewiswch lle rydych chi am wirio'
        }
      },
      uk: {
        fields: {
          title: 'Mae yna broblem',
          list: {
            text: 'Rhowch leoliad neu god post'
          }
        }
      },
      ni: {
        fields: {
          title: 'Mae yna broblem',
          list: {
            text: 'Rhowch god post'
          }
        }
      }
    },
    description:
      'Chwiliwch am ansawdd aer unrhyw ardal leol. Hefyd, mynnwch gyngor iechyd am lygredd aer a sut i leihau’ch amlygiad iddo.'
  },
  notFoundLocation: {
    heading: 'Gwirio ansawdd aer ',
    paragraphs: {
      a: 'Rydyn ni wedi methu dod o hyd i',
      b: 'Os buoch chi’n chwilio am le yng Nghymru, Lloegr neu’r Alban, fe ddylech chi:',
      c: 'gwirio’r sillafu',
      d: 'rhoi lleoliad ehangach',
      e: 'rhoi cod post cywir',
      f: 'Os buoch chi’n chwilio am le yng Ngogledd Iwerddon, Gwirio eich bod wedi rhoi’r cod post cywir.',
      g: 'Ewch yn ôl i chwilio am leoliad',
      h: 'Tudalen heb ei chanfod'
    }
  },
  notFoundUrl: {
    nonService: {
      pageTitle:
        'Ni allem ddod o hyd i’r dudalen hon - Gwirio ansawdd aer - GOV.UK',
      heading: 'Ni allem ddod o hyd i’r dudalen hon',
      paragraphs: {
        a: 'Ewch yn ôl i ansawdd aer'
      }
    },
    serviceAPI: {
      heading: 'Ni allem ddod o hyd i’r dudalen hon',
      paragraphs: {
        a: 'Ewch yn ôl i ansawdd aer'
      }
    }
  },
  multipleLocations: {
    title: 'Lleoliadau yn cyfateb',
    heading: 'Gwirio ansawdd aer ',
    serviceName: 'Gwirio ansawdd aer ',
    paragraphs: {
      a: 'Canfuwyd mwy nag un cyfatebiaeth ar gyfer eich lleoliad. Dewiswch y lleoliad cywir o’r opsiynau canlynol:',
      b: 'Fel arall,',
      c: 'ceisiwch chwilio eto'
    }
  },
  phaseBanner: {
    paragraphs: {
      a: 'Beta',
      b: 'Rhowch eich',
      c: 'adborth',
      d: 'ar y gwasanaeth newydd hwn'
    }
  },
  backlink: {
    text: 'Newid lleoliad'
  },
  cookieBanner: {
    title: 'Cwcis ar Gwirio ansawdd aer',
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
    cookies: 'Cwcis',
    privacy: 'Preifatrwydd',
    accessibility: 'Datganiad hygyrchedd',
    paragraphs: {
      a: "Mae'r holl gynnwys ar gael o dan y",
      b: 'Drwydded Llywodraeth Agored v3.0',
      c: 'ac eithrio lle nodir yn wahanol',
      d: 'Hawlfraint y Goron'
    }
  },
  daqi: {
    paragraphs: {
      a: 'Y rhagolwg llygredd aer heddiw yw',
      b: 'ar raddfa o isel i uchel iawn',
      c: 'allan o 10'
    },
    caption:
      'Mae’r mynegai ansawdd aer dyddiol(DAQI) yn dweud wrthoch chi am lefelau llygredd aer.Mae’n darparu cyngor iechyd ar gyfer y lefelau presennol.',
    summaryText:
      'Sut y gall lefelau gwahanol o lygredd aer effeithio ar iechyd',
    headText: {
      a: 'Lefel',
      b: 'Mynegai',
      c: 'Cyngor iechyd'
    },
    healthAdvice: {
      paragraphs: {
        a: 'Iechyd cyngor ar gyfer lefelau',
        b: 'o lygredd aer'
      }
    },
    pageTexts: {
      a: 'Crynodeb o lygredd aer y UK',
      b: 'Y diweddaraf am 5am ymlaen',
      c: 'Sut y gall llygryddion aer effeithio ar eich iechyd',
      d: 'Llygryddion aer sy’n cael eu monitro gerllaw'
    },
    pollutantText: {
      a: 'Mater gronynnol (PM)',
      b: 'Mae mater gronynnol yn ddarnau mân iawn o ronynnau solet neu hylif sydd wedi’u dal yn yr awyr.Maen nhw’n dod o ffynonellau fel teiars ceir, breciau, pibellau gwacáu, llwch, llosgi coed a phaill.',
      c: 'Yn cael eu cynhyrchu trwy losgi tanwyddau ffosil, er enghraifft, mewn ceir, gorsafoedd pŵer a ffatrïoedd.',
      d: 'Nwyon'
    },
    pollutantsNames: {
      a: 'PM2.5',
      b: 'PM10',
      c: 'Nitrogen deuocsid',
      d: 'Osôn',
      e: 'Sylffwr deuocsid'
    },
    pollutantTable: {
      a: 'milltir i ffwrdd',
      b: 'Llygrydd',
      c: 'Diweddaraf',
      d: 'Lefel',
      e: 'Amrediad isel',
      f: 'Mesur diweddaraf yn',
      g: 'ar'
    },
    levels: {
      a: 'Isel',
      b: 'Cymedrol',
      c: 'Uchel',
      d: 'Uchel iawn'
    },
    tooltipText: {
      level:
        'Cyfrifir y lefel ar sail y mynegai ansawdd aer dyddiol (DAQI). Mae 4 lefel: isel, cymedrol, uchel ac uchel iawn.',
      latest:
        'Mae’r darlleniadau’n cael eu mesur bob awr.Mae’r uned µg/&#13221; yn sefyll am ficrogramau (miliynfed o gram) am bob metr ciwbig o aer.'
    }
  },
  pollutants: {
    ozone: {
      title: 'Osôn(O₃)',
      pageTitle: 'Osôn(O₃) – Gwirio ansawdd aer – GOV.UK',
      headerText: `${WELSH_TITLE}`,
      headings: {
        a: 'Ffynonellau osôn',
        b: 'Effeithiau ar iechyd'
      },
      paragraphs: {
        a: 'Does dim ffynonellau allyriadau mawr o osôn ei hun. Mae osôn yn yr aer yn cael ei ffurfio gan adweithiau rhwng llygryddion eraill, er enghraifft, pan fydd llygryddion o geir, gorsafoedd pŵer a ffatrïoedd yn adweithio gyda golau’r haul.',
        b: 'Gall osôn ar lefel y ddaear fod ar lefelau afiach ar ddiwrnodau poeth ac oer. Gall deithio gyda’r gwynt, gan effeithio ar ardaloedd trefol a gwledig.',
        c: 'Gall amlygiad byrdymor i osôn achosi:',
        d: 'diffyg anadl, gwichian a phesychu',
        e: 'pyliau asthma',
        f: 'mwy o risg o heintiau’r anadl',
        g: 'llid yn y llygaid, y trwyn a’r gwddf',
        h: 'Gall amlygiad hirdymor i osôn arwain at y canlynol:',
        i: 'mwy o salwch yr anadl',
        j: 'materion y system nerfol',
        k: 'canser',
        l: 'materion y galon'
      },
      description:
        'Dysgwch sut mae osôn yn cael ei ffurfio. Hefyd, dysgwch am effeithiau iechyd byrdymor a hirdymor amlygiad i osôn.'
    },
    nitrogenDioxide: {
      title: 'Nitrogen deuocsid (NO₂)',
      pageTitle: 'Nitrogen deuocsid (NO₂) – Gwirio ansawdd aer – GOV.UK',
      headerText: `${WELSH_TITLE}`,
      headings: {
        a: 'Ffynonellau nitrogen deuocsid',
        b: 'Effeithiau ar iechyd'
      },
      paragraphs: {
        a: 'Mae nitrogen deuocsid yn nwy di-liw. Mae’n cael ei gynhyrchu’n bennaf yn sgil:',
        b: 'llosgi petrol neu ddisel mewn injan car',
        c: 'llosgi nwy naturiol mewn boeler gwres canolog neu orsaf bŵer',
        d: 'weldio',
        e: 'defnyddio ffrwydron',
        f: 'gweithgynhyrchu masnachol',
        g: 'gweithgynhyrchu bwyd',
        h: 'Gall amlygiad byrdymor i nitrogen deuocsid achosi:',
        i: 'pyliau asthma',
        j: 'heintiau’r anadl',
        k: 'symptomau cyflyrau’r ysgyfaint neu’r galon i waethygu',
        l: 'Gall amlygiad hirdymor i nitrogen deuocsid achosi:',
        m: 'mwy o risg o heintiau anadlol',
        n: 'gwaeth gweithrediad yr ysgyfaint mewn plant'
      },
      description:
        'Dysgwch sut mae nitrogen deuocsid yn cael ei gynhyrchu. Hefyd, dysgwch am effeithiau iechyd byrdymor a hirdymor amlygiad i nitrogen deuocsid.'
    },
    sulphurDioxide: {
      title: 'Sylffwr deuocsid (SO₂)',
      pageTitle: 'Sylffwr deuocsid (SO₂) – Gwirio ansawdd aer – GOV.UK',
      headerText: `${WELSH_TITLE}`,
      headings: {
        a: 'Ffynonellau sylffwr deuocsid',
        b: 'Effeithiau ar iechyd'
      },
      paragraphs: {
        a: 'Mae sylffwr deuocsid yn nwy di-liw sydd ag arogl cryf. Mae’n cael ei gynhyrchu’n bennaf yn sgil:',
        b: 'llosgi petrol neu ddisel mewn cerbydau',
        c: 'boeleri nwy',
        d: 'pwerdai sy’n llosgi glo',
        e: 'gweithgynhyrchu masnachol',
        f: 'gweithgynhyrchu bwyd',
        g: 'Gall amlygiad byrdymor achosi llid ar y canlynol:',
        h: 'llygaid',
        i: 'trwyn',
        j: 'gwddf',
        k: 'Gall amlygiad hirdymor ar lefelau uchel arwain at y canlynol:',
        l: 'llai o weithrediad yn yr ysgyfaint',
        m: 'newid synnwyr arogli',
        n: 'mwy o heintiau’r anadl'
      },
      description:
        'Dysgwch sut mae sylffwr deuocsid yn cael ei gynhyrchu. Hefyd, dysgwch am effeithiau iechyd byrdymor a thymor hir sylffwr deuocsid.'
    },
    particulateMatter10: {
      title: 'Mater gronynnol (PM10)',
      pageTitle: 'Mater gronynnol (PM10) – Gwirio ansawdd aer – GOV.UK',
      headerText: `${WELSH_TITLE}`,
      headings: {
        a: 'Ffynonellau PM10',
        b: 'Effeithiau ar iechyd'
      },
      paragraphs: {
        a: 'Mae mater gronynnol (PM) yn ronynnau mân iawn o solidau neu hylifau yn yr aer. Dim ond 10 micrometr mewn diamedr yw’r gronynnau.O ran cyd- destun, mae lled blewyn o wallt dynol yn 50 i 70 micrometr.',
        b: 'Prif ffynonellau mater gronynnol yw:',
        c: 'llwch o safleoedd adeiladu',
        d: 'llwch o safleoedd tirlenwi',
        e: 'llwch o amaethyddiaeth',
        f: 'tanau gwyllt',
        g: 'paill',
        h: 'gorsafoedd pŵer',
        i: 'Cerbydau',
        j: 'Mae effeithiau iechyd byrdmor PM10 yn cynnwys:',
        k: 'anhawster anadlu',
        l: 'pesychu',
        m: 'llid yn y llygaid, y trwyn a’r gwddf',
        n: 'tyndra a phoen y frest',
        o: 'Mae effeithiau hirdymor PM10 yn cynnwys:',
        p: 'difrod i feinwe’r ysgyfaint',
        q: 'asma',
        r: 'methiant y galon',
        s: 'canser',
        t: 'clefyd rhwystrol cronig yr ysgyfaint (COPD)'
      },
      description:
        'Mae PM10 yn fater gronynnol (PM) wedi’i wneud o ronynnau bach o solidau neu hylifau yn yr awyr. Dysgwch am ffynonellau PM10 a sut y gall amlygiad iddo effeithio ar iechyd.'
    },
    particulateMatter25: {
      title: 'Mater gronynnol (PM2.5)',
      pageTitle: 'Mater gronynnol (PM2.5) – Gwirio ansawdd aer – GOV.UK',
      headerText: 'Gwirio ansawdd aer',
      headings: {
        a: 'Ffynonellau PM2.5',
        b: 'Effeithiau ar iechyd'
      },
      paragraphs: {
        a: 'Mae mater gronynnol (PM) yn ronynnau mân iawn o solidau neu hylifau sydd yn yr aer. Dim ond 2.5 micrometr mewn diamedr yw’r gronynnau.O ran cyd- destun, mae lled blewyn o wallt dynol yn 50 i 70 micrometr.',
        b: 'Gall gronynnau PM2.5 gynnwys:',
        c: 'llwch',
        d: 'huddygl',
        e: 'mwg',
        f: 'diferion hylif',
        g: 'Prif ffynonellau mater gronynnol yw:',
        h: 'llosgi tanwydd mewn cerbydau, diwydiant ac eiddo domestig',
        i: 'traul ar deiars a breciau',
        j: 'pridd a llwch yn cael eu chwythu gan y gwynt',
        k: 'gronynnau ewyn y môr',
        l: 'llosgi llystyfiant',
        m: 'Gall effeithiau iechyd byrdymor PM2.5 gynnwys cyflyrau sy’n gwaethygu, fel:',
        n: 'asma',
        o: 'clefyd rhwystrol cronig yr ysgyfaint (COPD)',
        p: 'Gall effeithiau hirdymor PM2.5 gynnwys:',
        q: 'strôc',
        r: 'canser yr ysgyfaint',
        s: 'diabetes',
        t: 'clefyd Alzheimer a chlefyd Parkinson',
        u: 'iechyd ysgyfaint gwael mewn plant'
      },
      description:
        'Mae PM2.5 yn fater gronynnol (PM) wedi’i wneud o ronynnau bach o solidau neu hylifau yn yr awyr. Dysgwch am ffynonellau PM2.5 a sut y gall amlygiad iddo effeithio ar iechyd.'
    }
  },
  dailySummaryTexts: {
    paragraphs: {
      a: 'Rhagolwg y DU',
      b: 'Heddiw',
      c: 'Yfory',
      d: 'Rhagolwg'
    }
  },
  footer: {
    privacy: {
      pageTitle: 'Preifatrwydd - Gwirio ansawdd aer - GOV.UK',
      title: 'Hysbysiad preifatrwydd Gwirio ansawdd aer',
      heading: 'Gwirio ansawdd aer',
      headings: {
        a: 'Pwy sy’n casglu’ch data personol',
        b: 'Pa ddata personol rydyn ni’n ei gasglu a sut mae’n cael ei ddefnyddio',
        c: 'Y sail gyfreithlon dros brosesu’ch data personol',
        d: 'Cydsyniad i brosesu’ch data personol',
        e: 'Gyda phwy rydyn ni’n rhannu’ch data personol',
        f: 'Pa mor hir rydyn ni’n cadw data personol',
        g: 'Beth sy’n digwydd os na fyddwch chi’n darparu’r data personol ',
        h: 'Defnyddio penderfyniadau awtomataidd neu broffilio',
        i: 'Trosglwyddo’ch data personol y tu allan i’r Deyrnas Unedig ',
        j: 'Eich hawliau',
        k: 'Cwynion',
        l: 'Siarter gwybodaeth bersonol'
      },
      paragraphs: {
        a: 'Mae’r hysbysiad preifatrwydd yma yn esbonio sut mae’r gwasanaeth ansawdd aer lleol yn prosesu ac yn rhannu’ch data personol. Os oes gennych unrhyw ymholiadau am gynnwys yr hysbysiad preifatrwydd yma, anfonwch neges ebost at',
        b: 'Adran yr Amgylchedd, Bwyd a Materion Gwledig (Defra) yw’r rheolwr ar gyfer y data personol rydyn ni’n ei gasglu:',
        c: 'Adran yr Amgylchedd, Bwyd a Materion Gwledig',
        d: 'Seacole Building',
        e: '2 Marsham Street',
        f: 'London',
        g: 'SW1P 4DF',
        h: 'Os oes arnoch chi angen rhagor o wybodaeth am sut mae Defra yn defnyddio’ch data personol a’ch hawliau cysylltiedig, gallwch gysylltu â rheolwr diogelu data Defra yn ',
        i: 'neu yn y cyfeiriad uchod.',
        j: 'Swyddog diogelu data Defra sy’n gyfrifol am wirio bod Defra yn cydymffurfio â’r ddeddfwriaeth. Gallwch gysylltu â nhw yn',
        k0: 'Er mwyn i’r gwasanaeth fod yn weithredol, rydym yn casglu’r cod post neu’r enw lle rydych yn chwilio amdano gan fod hwn yn ddata hanfodol er mwyn i’r gwasanaeth roi data perthnasol.',
        k: 'Os byddwch yn derbyn y cwcis dadansoddol Google, yna byddwn yn casglu:',

        l: 'eich cyfeiriad IP fel y gallwn gasglu gwybodaeth am leoliad defnyddwyr ein gwasanaeth.',
        m: 'Bydd hyn yn ein helpu i weld pa leoliadau daearyddol sy’n defnyddio ein gwasanaeth.',
        n: "eich dyfais a’ch system weithredu i’n galluogi i wella ein gwasanaeth y term chwilio a ddefnyddiwyd gennych i ddod o hyd i 'Gwirio ansawdd aer' i’n galluogi i wella ein gwasanaeth",
        o: "y tudalennau rydych yn rhyngweithio â nhw yn 'Gwirio ansawdd aer' i'n galluogi i wella ein gwasanaeth",
        q: 'Y sail gyfreithlon dros brosesu’ch data personol er mwyn gwneud ymchwil ar effeithiolrwydd y gwasanaeth yw cydsyniad. Does dim rhaid ichi roi’ch cydsyniad a gallwch dynnu’ch cydsyniad yn ôl unrhyw bryd.',

        r: 'Mae prosesu eich data personol yn seiliedig ar ganiatâd. Nid ydym yn casglu unrhyw wybodaeth a allai fod yn gysylltiedig yn bersonol ag unigolyn; fodd bynnag, bydd y cyfeiriad IP yn cael ei gofnodi ar gyfer ymarferoldeb y gwasanaeth. ',
        r2: 'Os ydych wedi cydsynio i dderbyn cwcis, ni ellir dileu unrhyw wybodaeth a gasglwn yn ystod y broses hon gan na fyddwn yn gallu adnabod y wybodaeth honno i unigolyn penodol.',
        s: 'Dydyn ni ddim yn rhannu’r data personol sy’n cael ei gasglu dan yr hysbysiad preifatrwydd yma gyda sefydliadau eraill.',
        t: 'Rydyn ni’n parchu’ch preifatrwydd personol wrth ymateb i geisiadau am wybodaeth. Dim ond pan fo angen gwneud hynny er mwyn bodloni gofynion statudol Rheoliadau Gwybodaeth Amgylcheddol 2004 a Deddf Rhyddid Gwybodaeth 2000 y byddwn ni’n rhannu gwybodaeth.',
        u: 'Byddwn yn cadw’ch data personol am 7 mlynedd yn unol â gofynion y ddeddfwriaeth.',
        x: 'Os na fyddwch chi’n darparu data personol, sef y cod post neu’r lleoliad rydych chi’n chwilio amdano, yna fyddwch chi ddim yn gallu defnyddio’n gwasanaeth gan na fyddwn ni’n gallu darparu unrhyw ddata i chi.',
        y: 'Mae’r data personol arall yn ddewisol a dim ond ar gyfer gwella gwasanaethau y mae ei angen.',
        z: 'Dyw’r data personol rydych chi’n ei ddarparu ddim yn cael ei ddefnyddio ar gyfer y canlynol:',
        a0: 'gwneud penderfyniadau awtomataidd (gwneud penderfyniad drwy ddulliau awtomataidd heb unrhyw ymwneud dynol)',
        a1: 'proffilio (prosesu data personol yn awtomataidd i werthuso pethau penodol ynglŷn ag unigolyn)',
        a2: 'Dim ond i wlad arall y bernir ei bod yn ddigonol at ddibenion diogelu data y byddwn ni’n trosglwyddo’ch data personol.',
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
        a15: 'Swyddfa’r Comisiynydd Gwybodaeth',
        a16: 'Mae gennych chi hawl i',
        a17: 'wneud cwyn',
        a18: 'i Swyddfa’r Comisiynydd Gwybodaeth unrhyw bryd.',
        a19: 'Personal information charter',
        a20: 'Mae ein',
        a21: 'siarter gwybodaeth bersonol',
        a22: 'yn esbonio rhagor am eich hawliau dros eich data personol.',
        a23: 'Gallwch ',
        a24: 'optio i mewn ac allan o dderbyn cwcis.'
      },
      description:
        'Mae Gwirio ansawdd aer yn cymryd eich preifatrwydd o ddifrif. Darllenwch y Polisi Preifatrwydd yma i ddysgu sut rydyn ni’n trin eich data personol.'
    },
    cookies: {
      title: 'Cwcis',
      pageTitle: 'Cwcis - Gwirio ansawdd aer - GOV.UK',
      headings: {
        a: 'Cwcis hanfodol (cwbl angenrheidiol)',
        b: 'Cwcis dadansoddeg (dewisol)',
        c: 'Cwcis dadansoddeg rydyn ni’n eu defnyddio',
        d: 'Hoffech chi dderbyn cwcis dadansoddeg?'
      },
      table1: {
        title: 'Cwcis hanfodol rydyn ni’n eu defnyddio',
        text1: 'Enw',
        text2: 'Diben',
        text3: 'Yn dod i ben',
        text4: 'airaqie_cookies_analytics',
        text5: 'Cadw’ch gosodiadau caniatâd cwcis',
        text6: '1 flwyddyn'
      },
      table2: {
        title: 'Cwcis dadansoddeg rydyn ni’n eu defnyddio',
        text1: 'Enw',
        text2: 'Diben',
        text3: 'Yn dod i ben',
        text4:
          'Mae’n ein helpu i gyfrif faint o bobl sy’n ymweld â Gwirio ansawdd aer trwy ddweud wrthon ni a ydych chi wedi ymweld o’r blaen.',
        text5: '2 flynedd',
        text6: '_gid',
        text7:
          'Mae’n ein helpu i gyfrif faint o bobl sy’n ymweld â Gwirio ansawdd aer trwy ddweud wrthon ni a ydych chi wedi ymweld o’r blaen. ',
        text8: '24 awr',
        text9: 'Mae’n cael ei ddefnyddio i leihau nifer y ceisiadau.',
        text10: '1 funud',
        text11:
          'Rheolir data sy’n ymwneud â rhaglenni yn y cwci hwn ac mae’n ofynnol er mwyn i ymarferoldeb y rhaglen weithio.',
        text12: '30 munud'
      },
      paragraphs: {
        w: 'Mae',
        a: `${WELSH_TITLE}`,
        b: 'yn rhoi ffeiliau bach (o’r enw ’cwcis’) ar eich cyfrifiadur. ',
        c: 'Mae’r cwcis yma yn cael eu defnyddio ar draws gwefan Gwirio ansawdd aer.',
        d: 'Dim pan fydd JavaScript yn rhedeg yn eich porwr a phan fyddwch chi wedi’u derbyn y byddwn ni’n gosod cwcis. Os dewiswch chi beidio â rhedeg Javascript, fydd yr wybodaeth ar y tudalen yma ddim yn gymwys i chi.',
        e: 'Darganfyddwch',
        f: 'sut i reoli cwcis',
        g: 'drwy Swyddfa’r Comisiynydd Gwybodaeth.',
        h: 'Rydyn ni’n defnyddio cwci hanfodol i gofio pryd y byddwch chi’n derbyn neu’n gwrthod cwcis ar ein gwefan.',
        i: 'Rydyn ni’n defnyddio meddalwedd Google Analytics i ddeall sut mae pobl yn defnyddio Gwirio ansawdd aer. Rydyn ni’n gwneud hyn er mwyn helpu i sicrhau bod y wefan yn ateb anghenion ei defnyddwyr ac i’n helpu i wneud gwelliannau. ',
        j: 'Dydyn ni ddim yn casglu nac yn storio’ch gwybodaeth bersonol (er enghraifft eich enw neu’ch cyfeiriad) felly does dim modd defnyddio’r wybodaeth yma i wybod pwy ydych chi. ',
        k: 'Dydyn ni ddim yn caniatáu i Google ddefnyddio na rhannu’n data dadansoddeg.',
        l: 'Mae Google Analytics yn cadw gwybodaeth am y canlynol:',
        m: 'Y tudalennau rydych chi’n ymweld â nhw ',
        n: 'Pa mor hir rydych chi’n ei dreulio ar bob tudalen',
        o: 'Sut gwnaethoch chi gyrraedd y wefan',
        p: 'Beth rydych chi’n clicio arno wrth ymweld â’r wefan',
        q: 'Y ddyfais a’r porwr rydych chi’n eu defnyddio',
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
        'Mae Gwirio ansawdd aer yn defnyddio cwcis. Drwy ddefnyddio’r gwasanaeth yma rydych chi’n cytuno i’n defnydd o gwcis.'
    },
    accessibility: {
      title: 'Datganiad Hygyrchedd',
      pageTitle: 'Datganiad Hygyrchedd - Gwirio ansawdd aer - GOV.UK',
      headings: {
        a: 'Statws cydymffurfio',
        b: 'Paratoi’r datganiad hygyrchedd yma ',
        c: 'Adborth a gwybodaeth gysylltu',
        d: 'Gweithdrefn orfodi'
      },
      paragraphs: {
        a: 'Mae Adran yr Amgylchedd, Bwyd a Materion Gwledig wedi ymrwymo i wneud ei gwefannau yn hygyrch yn unol â Rheoliadau Hygyrchedd Cyrff y Sector Cyhoeddus (Gwefannau a Chymwysiadau Symudol) (Rhif 2) 2018. ',
        b: 'Mae’r datganiad hygyrchedd yma yn gymwys i',
        c: 'Mae’r wefan yma yn cydymffurfio’n llawn â safon AA fersiwn 2.2 o Ganllawiau Hygyrchedd Cynnwys y We (WCAG).',

        d: 'Cafodd y datganiad yma ei baratoi ar 18 Medi 2024.',
        e: 'Cafodd y wefan ei gwerthuso gan Adran yr Amgylchedd, Bwyd a Materion Gwledig. ',
        f: 'Y tro diwethaf i’r datganiad gael ei adolygu oedd 16 Medi 2024.',
        g: 'Os byddwch yn sylwi ar unrhyw fethiannau cydymffurfiaeth neu os oes angen ichi ofyn am wybodaeth a chynnwys sydd heb gael eu darparu yn y ddogfen yma, anfonwch neges ebost at',
        h: 'Y Comisiwn Cydraddoldeb a Hawliau Dynol (EHRC) sy’n gyfrifol am orfodi Rheoliadau Hygyrchedd Cyrff y Sector Cyhoeddus (Gwefannau a Chymwysiadau Symudol) (Rhif 2) 2018 (y ’rheoliadau hygyrchedd’). ',
        i: 'Os nad ydych chi’n fodlon ar y ffordd rydyn ni’n ymateb i’ch cwyn, cysylltwch â’r Gwasanaeth Cynghori a Chymorth Cydraddoldeb (EASS).'
      },
      description:
        'Mae Gwirio ansawdd aer wedi ymrwymo i wella hygyrchedd i bob defnyddiwr gwe, ffonau symudol ac ap, dan arweiniad y Canllawiau diweddaraf ar Hygyrchedd Cynnwys y We (WCAG).'
    }
  }
}

export const calendarWelsh = [
  'Ionawr',
  'Chwefror',
  'Mawrth',
  'Ebrill',
  'Mai',
  'Mehefin',
  'Gorffennaf',
  'Awst',
  'Medi',
  'Hydref',
  'Tachwedd',
  'Rhagfyr'
]
