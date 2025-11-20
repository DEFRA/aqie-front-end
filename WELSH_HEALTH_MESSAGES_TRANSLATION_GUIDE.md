# Welsh DAQI Health Messages Translation Guide

## Instructions for Welsh Translator

This document contains the English health messages that need to be translated into Welsh for the Air Quality Index system. Each section corresponds to a different pollution level (Low, Moderate, High, Very High).

**IMPORTANT NOTES:**

1. All translations should maintain the HTML structure (keep all `<p>`, `<ul>`, `<li>`, `<h3>` tags exactly as shown)
2. Keep the CSS classes unchanged (e.g., `class="govuk-list govuk-list--bullet"`, `class="govuk-heading-s"`)
3. The translated text will be inserted into a JavaScript template literal, so apostrophes in Welsh (') should be kept as-is
4. After translation, the technical team will handle the proper escaping for JavaScript

---

## 1. LOW LEVEL (Isel) - Values 1, 2, 3

### Current Welsh Translation

**advice:** "Mwynhewch eich gweithgareddau awyr agored arferol."

### NEW English Text to Translate

**advice (short summary):**

```
For most people, short term exposure to low levels of air pollution is not an issue.
```

**insetText (detailed information - HTML structure):**

```html
<p>
  For most people, short term exposure to low levels of air pollution is not an
  issue. Continue your usual outdoor activities.
</p>
<p>
  Some people might experience symptoms due to air pollution, even when levels
  are low.
</p>
<p>
  Adults and children with lung or heart conditions are at greater risk of
  experiencing symptoms.
</p>
<p>Symptoms could include:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>coughing</li>
  <li>chest tightness and pain</li>
  <li>difficulty breathing</li>
  <li>worsening of asthma symptoms</li>
  <li>worsening of heart-related symptoms, such as heart palpitations</li>
  <li>worsening of chronic obstructive pulmonary disease (COPD) symptoms</li>
</ul>
<p>
  Follow your doctor or nurse's usual advice about physically demanding
  activities and managing your condition.
</p>
<p>
  Follow your agreed management plan if you have one – for example, an asthma
  action plan. Ask your doctor or nurse for a plan if you do not have one.
</p>
<p>
  Also consider the impact of other triggers on your symptoms – for example,
  high pollen outside or poor air quality indoors.
</p>
```

**atrisk summaries:**

- **adults:** "Some people may experience symptoms, even when levels are low."
- **asthma:** "People with asthma should follow their usual management plan."
- **oldPeople:** "Older people with heart or lung conditions should follow usual advice."

---

## 2. MODERATE LEVEL (Cymedrol) - Values 4, 5, 6

### Current Welsh Translation

**advice:** "I'r rhan fwyaf o bobl, dyw amlygiad byrdymor i lefelau cymedrol o lygredd aer ddim yn broblem."

### NEW English Text to Translate

**advice (short summary):**

```
For most people, short term exposure to moderate levels of air pollution is not an issue.
```

**insetText (detailed information - HTML structure):**

```html
<p>
  For most people, short term exposure to moderate levels of air pollution is
  not an issue. Continue your usual outdoor activities. However, if you are
  experiencing symptoms, try to reduce your exposure to air pollution.
</p>
<p>
  However, some people may experience symptoms of exposure to air pollution.
  These can start within hours or several days after exposure.
</p>

<h3 class="govuk-heading-s">Short term air pollution exposure</h3>

<p>
  Short term exposure (over hours or days) can cause a range of health impacts,
  including:
</p>
<ul class="govuk-list govuk-list--bullet">
  <li>coughing</li>
  <li>eye, nose, and throat irritation</li>
  <li>chest tightness and pain</li>
  <li>difficulty breathing</li>
  <li>worsening of asthma symptoms</li>
  <li>worsening of heart-related symptoms, such as heart palpitations</li>
  <li>worsening of chronic obstructive pulmonary disease (COPD) symptoms</li>
</ul>

<p>
  Symptoms could start within hours or several days after exposure to air
  pollution.
</p>

<p>Speak to your doctor or nurse if:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>you have new symptoms</li>
  <li>your symptoms get worse</li>
  <li>your symptoms do not get better after a week</li>
</ul>

<p>
  Also consider the impact of other triggers on your symptoms – for example,
  high pollen outside or poor air quality indoors.
</p>

<h3 class="govuk-heading-s">
  Advice for adults and children with lung or heart conditions
</h3>

<p>
  Try to adapt physically demanding activities outdoors, especially if your
  symptoms get worse.
</p>
<p>
  Follow your agreed management plan if you have one – for example, an asthma
  action plan. Ask your doctor or nurse for a plan if you do not have one.
</p>
```

**atrisk summaries (keep existing):**

- **adults:** "Dylai oedolion sydd â phroblemau'r galon ac sy'n teimlo'n sâl ystyried gwneud ymarfer corff llai egnïol, yn enwedig y tu allan."
- **asthma:** "Dylai pobl sydd ag asthma fod yn barod i ddefnyddio'u hanadlydd lliniaru."
- **oldPeople:** "Dylai pobl hŷn ystyried gwneud gweithgareddau llai egnïol, yn enwedig y tu allan."

---

## 3. HIGH LEVEL (Uchel) - Values 7, 8, 9

### Current Welsh Translation

**advice:** "Dylai unrhyw un sy'n profi anghysur fel dolur llygaid, peswch neu ddolur gwddf ystyried lleihau eu gweithgareddau, yn enwedig yn yr awyr agored."

### NEW English Text to Translate

**advice (short summary):**

```
Anyone experiencing discomfort such as sore eyes, cough or sore throat should consider reducing activity, particularly outdoors.
```

**insetText (detailed information - HTML structure):**

```html
<p>
  Anyone experiencing discomfort such as sore eyes, cough or sore throat should
  consider reducing activity, particularly outdoors.
</p>
<p>
  Some people may experience more severe symptoms due to high air pollution.
</p>

<h3 class="govuk-heading-s">
  Short term exposure to high air pollution levels
</h3>

<p>
  Short term exposure to high levels can cause more significant health impacts,
  including:
</p>
<ul class="govuk-list govuk-list--bullet">
  <li>increased coughing</li>
  <li>more severe difficulty breathing</li>
  <li>eye, nose, and throat irritation</li>
  <li>significant worsening of asthma symptoms</li>
  <li>worsening of heart-related symptoms</li>
  <li>breathing difficulties for people with COPD</li>
</ul>

<p>If you experience symptoms, try to reduce your outdoor activities.</p>

<h3 class="govuk-heading-s">
  Advice for adults and children with lung or heart conditions
</h3>

<p>
  You should reduce strenuous physical activities, especially outdoors. Follow
  your agreed management plan.
</p>
<p>Be prepared to use your medication more frequently if needed.</p>
```

**atrisk summaries (keep existing):**

- **adults:** "Dylai oedolion sydd â phroblemau'r galon leihau ymdrech gorfforol egnïol, yn arbennig yn yr awyr agored, yn enwedig os ydynt yn profi symptomau."
- **asthma:** "Efallai y bydd pobl sydd ag asthma yn gweld bod angen defnyddio'u hnanadlydd llliniaru yn amlach."
- **oldPeople:** "Dylai pobl hŷn leihau eu hymdrech gorfforol."

---

## 4. VERY HIGH LEVEL (Uchel Iawn) - Value 10

### Current Welsh Translation

**advice:** "Ewch ati i leihau'ch ymdrech gorfforol, yn enwedig yn yr awyr agored, yn arbennig os ydych chi'n profi symptomau fel peswch neu ddolur gwddf."

### NEW English Text to Translate

**advice (short summary):**

```
Reduce physical exertion, particularly outdoors, especially if you experience symptoms such as cough or sore throat.
```

**insetText (detailed information - HTML structure):**

```html
<p>
  Reduce physical exertion, particularly outdoors, especially if you experience
  symptoms such as cough or sore throat.
</p>
<p>Very high levels of air pollution can cause serious health effects.</p>

<h3 class="govuk-heading-s">Advice for everyone</h3>

<p>
  Everyone should reduce strenuous physical activities outdoors when pollution
  levels are very high.
</p>

<h3 class="govuk-heading-s">Advice for people with health conditions</h3>

<p>If you have a lung or heart condition:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>Avoid strenuous physical activities outdoors</li>
  <li>Follow your agreed management plan</li>
  <li>Keep your medication with you</li>
  <li>Contact your doctor if your symptoms get worse</li>
</ul>

<p>
  If you have asthma, you may need to use your reliever inhaler more often. Make
  sure you have it with you at all times.
</p>
```

**atrisk summaries (keep existing):**

- **adults:** "Dylai oedolion sydd â phroblemau'r galon osgoi gweithgareddau corfforol egnïol."
- **asthma:** "Efallai y bydd angen i bobl sydd ag asthma ddefnyddio'u hanadlydd lliniaru yn amlach."
- **oldPeople:** "Dylai pobl hŷn osgoi gweithgareddau corfforol egnïol."

---

## Translation Checklist

For each pollution level, please provide Welsh translations for:

- [ ] **LOW (isel)**: advice + insetText + 3 atrisk summaries
- [ ] **MODERATE (cymedrol)**: advice + insetText (keep existing atrisk)
- [ ] **HIGH (uchel)**: advice + insetText (keep existing atrisk)
- [ ] **VERY HIGH (uchelIawn)**: advice + insetText (keep existing atrisk)

## Notes for Translator

1. Medical/technical terms to maintain consistency:
   - "asthma" → "asthma"
   - "COPD" → "COPD" (clefyd rhwystrol cronig yr ysgyfaint)
   - "heart palpitations" → (use appropriate Welsh medical term)
2. Keep all HTML tags and class names in English
3. Maintain paragraph structure
4. Keep bullet point lists in the same order
5. Use formal/polite Welsh appropriate for government health guidance

## After Translation

Once translation is complete, please save the Welsh text and notify the development team who will:

1. Format it properly for JavaScript
2. Handle apostrophe escaping
3. Add it to the `src/server/data/cy/air-quality.js` file
4. Test the implementation
