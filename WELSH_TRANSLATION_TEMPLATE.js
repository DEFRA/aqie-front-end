// WELSH TRANSLATION TEMPLATE
// This file shows the exact structure needed for Welsh translations
// Replace [WELSH TRANSLATION HERE] with the appropriate Welsh text

export const commonMessages = {
  isel: {
    values: [1, 2, 3],
    // '' AQC-657: Updated Welsh health advice for low levels
    advice:
      "[WELSH TRANSLATION: For most people, short term exposure to low levels of air pollution is not an issue.]",
    insetText: `[WELSH TRANSLATION OF FULL HTML BLOCK - See Translation Guide Section 1]`,
    atrisk: {
      // '' Provide distinct at-risk summaries
      adults:
        "[WELSH: Some people may experience symptoms, even when levels are low.]",
      asthma: "[WELSH: People with asthma should follow their usual management plan.]",
      oldPeople:
        "[WELSH: Older people with heart or lung conditions should follow usual advice.]"
    },
    outlook:
      'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.'
  },
  cymedrol: {
    values: [4, 5, 6],
    advice:
      "[WELSH TRANSLATION: For most people, short term exposure to moderate levels of air pollution is not an issue.]",
    insetText: `[WELSH TRANSLATION OF FULL HTML BLOCK - See Translation Guide Section 2]`,
    atrisk: {
      adults:
        "Dylai oedolion sydd â phroblemau'r galon ac sy'n teimlo'n sâl ystyried gwneud ymarfer corff llai egnïol, yn enwedig y tu allan.",
      asthma:
        "Dylai pobl sydd ag asthma fod yn barod i ddefnyddio'u hanadlydd lliniaru.",
      oldPeople:
        'Dylai pobl hŷn ystyried gwneud gweithgareddau llai egnïol, yn enwedig y tu allan.'
    },
    outlook:
      'The influx of warm air from the continent is resulting in moderate air pollution levels throughout many areas today.'
  },
  uchel: {
    values: [7, 8, 9],
    advice:
      "[WELSH TRANSLATION: Anyone experiencing discomfort such as sore eyes, cough or sore throat should consider reducing activity, particularly outdoors.]",
    insetText: `[WELSH TRANSLATION OF FULL HTML BLOCK - See Translation Guide Section 3]`,
    atrisk: {
      adults:
        "Dylai oedolion sydd â phroblemau'r galon leihau ymdrech gorfforol egnïol, yn arbennig yn yr awyr agored, yn enwedig os ydynt yn profi symptomau.",
      asthma:
        "Efallai y bydd pobl sydd ag asthma yn gweld bod angen defnyddio'u hnanadlydd llliniaru yn amlach.",
      oldPeople: "Dylai pobl hŷn leihau eu hymdrech gorfforol."
    },
    outlook:
      'Warm temperatures are expected to increase pollution levels to high across many areas today.'
  },
  uchelIawn: {
    values: [10],
    advice:
      "[WELSH TRANSLATION: Reduce physical exertion, particularly outdoors, especially if you experience symptoms such as cough or sore throat.]",
    insetText: `[WELSH TRANSLATION OF FULL HTML BLOCK - See Translation Guide Section 4]`,
    atrisk: {
      adults:
        "Dylai oedolion sydd â phroblemau'r galon osgoi gweithgareddau corfforol egnïol.",
      asthma:
        "Efallai y bydd angen i bobl sydd ag asthma ddefnyddio'u hanadlydd lliniaru yn amlach.",
      oldPeople: 'Dylai pobl hŷn osgoi gweithgareddau corfforol egnïol.'
    },
    outlook:
      'The current heatwave shows no signs of relenting, causing air pollution levels to remain very high across many areas today.'
  },
  unknown: {
    advice: 'Dim data ar gael.'
  }
}

/* 
EXAMPLE OF PROPERLY FORMATTED insetText:

For LOW level, the insetText should look like this (but in Welsh):

    insetText: `<p>For most people, short term exposure to low levels of air pollution is not an issue. Continue your usual outdoor activities.</p>
<p>Some people might experience symptoms due to air pollution, even when levels are low.</p>
<p>Adults and children with lung or heart conditions are at greater risk of experiencing symptoms.</p>
<p>Symptoms could include:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>coughing</li>
    <li>chest tightness and pain</li>
    <li>difficulty breathing</li>
    <li>worsening of asthma symptoms</li>
    <li>worsening of heart-related symptoms, such as heart palpitations</li>
    <li>worsening of chronic obstructive pulmonary disease (COPD) symptoms</li>
</ul>
<p>Follow your doctor or nurse's usual advice about physically demanding activities and managing your condition.</p>
<p>Follow your agreed management plan if you have one – for example, an asthma action plan. Ask your doctor or nurse for a plan if you do not have one.</p>
<p>Also consider the impact of other triggers on your symptoms – for example, high pollen outside or poor air quality indoors.</p>`,

IMPORTANT NOTES:
1. Use backticks ` to start and end the insetText
2. Keep all HTML tags exactly as shown
3. Keep all class="..." attributes unchanged
4. Don't worry about apostrophes in Welsh - the dev team will handle escaping
5. Maintain the indentation for readability
*/
