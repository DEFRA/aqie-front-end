''
import { WELSH_TITLE } from '../constants.js'

/**
 * Welsh translations for DAQI display and pollutant information pages
 */
export const daqiTranslationsWelsh = {
  daqi: {
    forecastIntro: 'Y rhagolwg llygredd aer heddiw yw',
    description: {
      a: 'Gwiriwch ansawdd aer',
      b: ". Mynnwch gyngor ar iechyd, gwybodaeth am lygryddion a chanllawiau ar sut i leihau'ch amlygiad i lygrydd aer."
    },
    caption:
      "Mae'r mynegai ansawdd aer dyddiol(DAQI) yn dweud wrthoch chi am lefelau llygredd aer.Mae'n darparu cyngor iechyd ar gyfer y lefelau presennol.",
    summaryText:
      'Sut y gall lefelau gwahanol o lygredd aer effeithio ar iechyd',
    predictionLinkText: 'Gwybodaeth am',
    predictionLink: "sut mae llygredd aer yn cael ei rag-weld a'i fesur.",
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
      b: 'Y diweddaraf am',
      c: 'Sut y gall llygryddion aer effeithio ar eich iechyd',
      d: "Llygryddion aer sy'n cael eu monitro gerllaw",
      ukForecast: 'Rhagolwg y DU'
    },
    headings: {
      main: 'Mynegai Ansawdd Aer Dyddiol (DAQI)',
      predictedLevels: 'Lefelau llygredd aer a ragwelir'
    },
    tabs: {
      today: 'Heddiw'
    },
    pollutantText: {
      a: 'Mater gronynnol (PM)',
      b: "Mae mater gronynnol yn ddarnau mân iawn o ronynnau solet neu hylif sydd wedi'u dal yn yr awyr.Maen nhw'n dod o ffynonellau fel teiars ceir, breciau, pibellau gwacáu, llwch, llosgi coed a phaill.",
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
      latest1: 'Mae’r darlleniadau’n cael eu mesur bob awr. Mae’r uned µg/m',
      latest2:
        ' yn sefyll am ficrogramau (miliynfed o gram) am bob metr ciwbig o aer.'
    },
    // '' AQC-657: Adran cyngor ar leihau amlygiad (HTML trwy'r partial) - TODO: adolygu cyfieithiad
    exposureHtml: `<h2 class="govuk-heading-m">Sut y gallwch leihau eich amlygiad i lygredd aer</h2>
<p>Ystyriwch y camau canlynol:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>dewiswch lwybrau gyda llai o draffig, yn enwedig ar adegau prysur o'r diwrnod</li>
  <li>teithiwch i'r gwaith, cerddwch neu ymarferwch mewn parciau neu leoedd gwyrdd eraill, os nad ydych yn cael eich effeithio gan baill</li>
  <li>os ydych yn ymarfer dan do, gwnewch yn siŵr bod yr ystafell wedi'i hawyru'n dda</li>
</ul>
<p>Cael mwy o gyngor ar <a class="govuk-link" href="/proto-dev-new/actions?locationName=&parentArea=">gamau y gallwch eu cymryd i leihau eich amlygiad i lygredd aer</a>.</p>
<p>Gall amlygiad hirdymor i lygredd aer (dros flynyddoedd) arwain at lawer o wahanol <a class="govuk-link" href="/proto-dev-new/health-effects?locationName=&parentArea=">gyflyrau iechyd</a> ac ostwng disgwyliad oes.</p>`
  }
}

export const pollutantTranslationsWelsh = {
  // sonar-disable-next-line javascript:S1192
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
        a: "Does dim ffynonellau allyriadau mawr o osôn ei hun. Mae osôn yn yr aer yn cael ei ffurfio gan adweithiau rhwng llygryddion eraill, er enghraifft, pan fydd llygryddion o geir, gorsafoedd pŵer a ffatrïoedd yn adweithio gyda golau'r haul.",
        b: "Gall osôn ar lefel y ddaear fod ar lefelau afiach ar ddiwrnodau poeth ac oer. Gall deithio gyda'r gwynt, gan effeithio ar ardaloedd trefol a gwledig.",
        c: 'Gall amlygiad byrdymor i osôn achosi:',
        d: 'diffyg anadl, gwichian a phesychu',
        e: 'pyliau asthma',
        f: "mwy o risg o heintiau'r anadl",
        g: "llid yn y llygaid, y trwyn a'r gwddf",
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
        a: "Mae nitrogen deuocsid yn nwy di-liw. Mae'n cael ei gynhyrchu'n bennaf yn sgil:",
        b: 'llosgi petrol neu ddisel mewn injan car',
        c: 'llosgi nwy naturiol mewn boeler gwres canolog neu orsaf bŵer',
        d: 'weldio',
        e: 'defnyddio ffrwydron',
        f: 'gweithgynhyrchu masnachol',
        g: 'gweithgynhyrchu bwyd',
        h: 'Gall amlygiad byrdymor i nitrogen deuocsid achosi:',
        i: 'pyliau asthma',
        j: "heintiau'r anadl",
        k: "symptomau cyflyrau'r ysgyfaint neu'r galon i waethygu",
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
        a: "Mae sylffwr deuocsid yn nwy di-liw sydd ag arogl cryf. Mae'n cael ei gynhyrchu'n bennaf yn sgil:",
        b: 'llosgi petrol neu ddisel mewn cerbydau',
        c: 'boeleri nwy',
        d: "pwerdai sy'n llosgi glo",
        e: 'gweithgynhyrchu masnachol',
        f: 'gweithgynhyrchu bwyd',
        g: 'Gall amlygiad byrdymor achosi llid ar y canlynol:',
        h: 'llygaid',
        i: 'trwyn',
        j: 'gwddf',
        k: 'Gall amlygiad hirdymor ar lefelau uchel arwain at y canlynol:',
        l: 'llai o weithrediad yn yr ysgyfaint',
        m: 'newid synnwyr arogli',
        n: "mwy o heintiau'r anadl"
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
        a: "Mae mater gronynnol (PM) yn ronynnau mân iawn o solidau neu hylifau yn yr aer. Dim ond 10 micrometr mewn diamedr yw'r gronynnau.O ran cyd- destun, mae lled blewyn o wallt dynol yn 50 i 70 micrometr.",
        b: 'Prif ffynonellau mater gronynnol yw:',
        c: 'llwch o safleoedd adeiladu',
        d: 'llwch o safleoedd tirlenwi',
        e: 'llwch o amaethyddiaeth',
        f: 'tanau gwyllt',
        g: 'paill',
        h: 'gorsafoedd pŵer',
        i: 'Cerbydau',
        j: 'Mae effeithiau iechyd byrdymor PM10 yn cynnwys:',
        k: 'anhawster anadlu',
        l: 'pesychu',
        m: "llid yn y llygaid, y trwyn a'r gwddf",
        n: 'tyndra a phoen y frest',
        o: 'Mae effeithiau hirdymor PM10 yn cynnwys:',
        p: "difrod i feinwe'r ysgyfaint",
        q: 'asma',
        r: 'methiant y galon',
        s: 'canser',
        t: 'clefyd rhwystrol cronig yr ysgyfaint (COPD)'
      },
      description:
        "Mae PM10 yn fater gronynnol (PM) wedi'i wneud o ronynnau bach o solidau neu hylifau yn yr awyr. Dysgwch am ffynonellau PM10 a sut y gall amlygiad iddo effeithio ar iechyd."
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
        a: "Mae mater gronynnol (PM) yn ronynnau mân iawn o solidau neu hylifau sydd yn yr aer. Dim ond 2.5 micrometr mewn diamedr yw'r gronynnau.O ran cyd- destun, mae lled blewyn o wallt dynol yn 50 i 70 micrometr.",
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
        m: "Gall effeithiau iechyd byrdymor PM2.5 gynnwys cyflyrau sy'n gwaethygu, fel:",
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
        "Mae PM2.5 yn fater gronynnol (PM) wedi'i wneud o ronynnau bach o solidau neu hylifau yn yr awyr. Dysgwch am ffynonellau PM2.5 a sut y gall amlygiad iddo effeithio ar iechyd."
    }
  }
}
