import { Application, ValidationResult } from '../types';

export function generateCustomerFollowUp(
  app: Application,
  validation: ValidationResult,
  language: 'en' | 'hi' | 'ta' = 'en'
): string {
  if (validation.isComplete) {
    if (language === 'hi') {
      return `प्रिय ${app.applicantName || 'आवेदक'},\n\nआपके व्यक्तिगत ऋण आवेदन (आईडी: ${app.id}) के सभी आवश्यक दस्तावेज़ और विवरण सफलतापूर्वक प्राप्त और सत्यापित हो चुके हैं। इस समय किसी अतिरिक्त फ़ॉलो-अप की आवश्यकता नहीं है।\n\nसादर,\nऋण परिचालन टीम`;
    }
    if (language === 'ta') {
      return `அன்புள்ள ${app.applicantName || 'விண்ணப்பதாரர்'},\n\nஉங்கள் தனிநபர் கடன் விண்ணப்பத்திற்கான (விண்ணப்ப எண்: ${app.id}) அனைத்து ஆவணங்களும் வெற்றிகரமாக பெறப்பட்டு சரிபார்க்கப்பட்டன. தற்போது கூடுதல் ஆவணங்கள் எதுவும் தேவையில்லை.\n\nநன்றி,\nகடன் செயல்பாட்டுக் குழு`;
    }
    return `Dear ${app.applicantName || 'Applicant'},\n\nThank you for applying for a Personal Loan (Application ID: ${app.id}). All submitted documents and application details have been received and verified. No further follow-up items are pending at this intake stage.\n\nWarm regards,\nLoan Operations Team`;
  }

  const bulletItemsEn: string[] = [];
  const bulletItemsHi: string[] = [];
  const bulletItemsTa: string[] = [];

  validation.findings.forEach((finding) => {
    switch (finding.ruleId) {
      case 'MISS_DOC_PAN':
        bulletItemsEn.push('Self-attested PAN card copy (mandatory government identity proof).');
        bulletItemsHi.push('स्व-सत्यापित पैन कार्ड की प्रतिलिपि (अनिवार्य पहचान प्रमाण)।');
        bulletItemsTa.push('சுய சான்றளிக்கப்பட்ட பான் கார்டு நகல் (கட்டாய அடையாளச் சான்று).');
        break;
      case 'MISS_DOC_ADDRESS':
        bulletItemsEn.push('Recent address proof (Electricity bill / Aadhaar / Gas bill issued within last 90 days).');
        bulletItemsHi.push('हालिया निवास प्रमाण पत्र (बिजली बिल / आधार कार्ड / गैस बिल, 90 दिनों के भीतर जारी)।');
        bulletItemsTa.push('சமீபத்திய முகவரிச் சான்று (மின் கட்டண ரசீது / ஆதார் / எரிவாயு ரசீது, கடந்த 90 நாட்களுக்குள்).');
        break;
      case 'MISS_DOC_BANK_STMT':
        bulletItemsEn.push('Latest 6 continuous months bank account statement in original PDF format.');
        bulletItemsHi.push('मूल पीडीएफ प्रारूप में पिछले 6 महीनों का निरंतर बैंक खाता विवरण (स्टेटमेंट)।');
        bulletItemsTa.push('கடந்த 6 மாதங்களுக்கான தொடர்ச்சியான வங்கி கணக்கு அறிக்கை (PDF வடிவில்).');
        break;
      case 'MISS_DOC_INCOME_SALARIED':
        bulletItemsEn.push('Latest 3 months salary slips or latest Form 16 issued by your employer.');
        bulletItemsHi.push('नियोक्ता द्वारा जारी पिछले 3 महीनों की वेतन पर्ची (Salary Slips) या नवीनतम फॉर्म 16।');
        bulletItemsTa.push('உங்கள் நிறுவனத்தால் வழங்கப்பட்ட கடந்த 3 மாத சம்பள சீட்டுகள் அல்லது படிவம் 16.');
        break;
      case 'MISS_DOC_INCOME_SELF_EMP':
        bulletItemsEn.push('Income Tax Return (ITR-V) acknowledgments & computation of income for the last 2 assessment years.');
        bulletItemsHi.push('पिछले 2 आकलन वर्षों का आयकर रिटर्न (ITR-V) पावती और आय गणना पत्र।');
        bulletItemsTa.push('கடந்த 2 மதிப்பீட்டு ஆண்டுகளுக்கான வருமான வரி கணக்கு (ITR) ரசீது மற்றும் கணக்கீடு.');
        break;
      case 'PAN_FORMAT_INVALID':
        bulletItemsEn.push('A valid 10-character PAN number matching the Income Tax Department database.');
        bulletItemsHi.push('आयकर विभाग के अनुसार वैध 10-अंकीय पैन नंबर की सही प्रविष्टि।');
        bulletItemsTa.push('வருமான வரித்துறை தரவுத்தளத்துடன் பொருந்தக்கூடிய சரியான 10 எழுத்து பான் எண்.');
        break;
      case 'MOBILE_FORMAT_INVALID':
        bulletItemsEn.push('A valid 10-digit Indian mobile phone number for verification.');
        bulletItemsHi.push('सत्यापन और ओटीपी के लिए एक वैध 10-अंकीय भारतीय मोबाइल नंबर।');
        bulletItemsTa.push('சரிபார்ப்பிற்கான சரியான 10 இலக்க இந்திய மொபைல் எண்.');
        break;
      case 'PAN_NAME_MISMATCH':
        bulletItemsEn.push(`Clarification regarding name difference: application says "${app.applicantName}" while PAN card reflects "${finding.found}".`);
        bulletItemsHi.push(`नाम में अंतर का स्पष्टीकरण: आवेदन में "${app.applicantName}" है जबकि पैन कार्ड में "${finding.found}" है।`);
        bulletItemsTa.push(`பெயர் மாறுபாடு குறித்த விளக்கம்: விண்ணப்பத்தில் "${app.applicantName}" எனவும் பான் கார்டில் "${finding.found}" எனவும் உள்ளது.`);
        break;
      case 'EMPLOYER_MISMATCH':
        bulletItemsEn.push(`Clarification regarding employer: application states "${app.declaredEmployer}" while income document reflects "${finding.found}".`);
        bulletItemsHi.push(`नियोक्ता/कंपनी का स्पष्टीकरण: आवेदन में "${app.declaredEmployer}" दर्ज है जबकि दस्तावेज़ में "${finding.found}" है।`);
        bulletItemsTa.push(`நிறுவனத்தின் பெயர் விளக்கம்: விண்ணப்பத்தில் "${app.declaredEmployer}" எனவும் ஆவணத்தில் "${finding.found}" எனவும் உள்ளது.`);
        break;
      case 'INCOME_MISMATCH':
        bulletItemsEn.push(`Reconciliation of income: declared monthly income of ${finding.found} differs from document income of ${finding.expected}.`);
        bulletItemsHi.push(`मासिक आय में अंतर का स्पष्टीकरण: घोषित आय (${finding.found}) और दस्तावेज़ की आय (${finding.expected}) में अंतर है।`);
        bulletItemsTa.push(`வருமான வேறுபாடு குறித்த விளக்கம்: விண்ணப்பிக்கப்பட்ட வருமானம் (${finding.found}) ஆவண வருமானத்துடன் (${finding.expected}) வேறுபடுகிறது.`);
        break;
      case 'STATEMENT_PERIOD_DEFICIT':
        bulletItemsEn.push('Bank account statement covering the full required 6 months period (currently incomplete period).');
        bulletItemsHi.push('पूरे 6 महीनों को कवर करने वाला पूर्ण बैंक स्टेटमेंट (वर्तमान स्टेटमेंट अपूर्ण है)।');
        bulletItemsTa.push('முழுமையான 6 மாதங்களை உள்ளடக்கிய வங்கி கணக்கு அறிக்கை.');
        break;
      case 'STATEMENT_GAP_DETECTED':
        bulletItemsEn.push('Complete, unbroken bank statement pages covering all intermediate date gaps.');
        bulletItemsHi.push('बिना किसी छूटे हुए पृष्ठ या तारीख अंतराल के संपूर्ण बैंक खाता विवरण।');
        bulletItemsTa.push('எந்த இடைவெளியும் இல்லாத முழுமையான தொடர்ச்சியான வங்கி அறிக்கை.');
        break;
      default:
        bulletItemsEn.push(`${finding.field}: ${finding.explanation}`);
        bulletItemsHi.push(`${finding.field}: कृपया आवश्यक जानकारी या स्पष्ट दस्तावेज़ प्रदान करें।`);
        bulletItemsTa.push(`${finding.field}: தயவுசெய்து தேவையான ஆவணத்தை வழங்கவும்.`);
        break;
    }
  });

  if (language === 'hi') {
    return [
      `प्रिय ${app.applicantName || 'आवेदक'},`,
      '',
      `आपके व्यक्तिगत ऋण आवेदन (आईडी: ${app.id}) के प्रारंभिक सत्यापन के संबंध में यह संदेश है।`,
      'आपके आवेदन को अग्रिम क्रेडिट समीक्षा हेतु आगे बढ़ाने के लिए, कृपया निम्नलिखित आवश्यक दस्तावेज़/स्पष्टीकरण जल्द से जल्द प्रदान करें:',
      '',
      ...bulletItemsHi.map((item, idx) => `${idx + 1}. ${item}`),
      '',
      'कृपया इन दस्तावेज़ों को अपने पंजीकृत ईमेल या हमारे सुरक्षित ग्राहक पोर्टल के माध्यम से अपलोड करें।',
      '',
      'सादर,',
      'ऋण परिचालन एवं इनटेक विभाग',
      'नोट: यह केवल दस्तावेज़ पूर्णता अनुरोध है, कोई ऋण स्वीकृति या अस्वीकृति निर्णय नहीं है।',
    ].join('\n');
  }

  if (language === 'ta') {
    return [
      `அன்புள்ள ${app.applicantName || 'விண்ணப்பதாரர்'},`,
      '',
      `உங்கள் தனிநபர் கடன் விண்ணப்பம் (எண்: ${app.id}) தொடர்பாக தொடர்பு கொள்கிறோம்.`,
      'உங்கள் விண்ணப்பத்தை அடுத்த கட்ட பரிசீலனைக்கு எடுத்துச்செல்ல, கீழே குறிப்பிடப்பட்டுள்ள ஆவணங்கள் அல்லது விளக்கங்களை உடனடியாக வழங்கும்படி கேட்டுக்கொள்கிறோம்:',
      '',
      ...bulletItemsTa.map((item, idx) => `${idx + 1}. ${item}`),
      '',
      'தயவுசெய்து இந்த ஆவணங்களை உங்கள் பதிவுசெய்த மின்னஞ்சல் அல்லது எங்களின் வாடிக்கையாளர் இணையதளத்தில் பதிவேற்றவும்.',
      '',
      'நன்றி,',
      'கடன் செயல்பாட்டுக் குழு',
      'குறிப்பு: இது ஆவண சரிபார்ப்பு கோரிக்கை மட்டுமே, எந்தவித கடன் முடிவும் அல்ல.',
    ].join('\n');
  }

  // English (Default)
  return [
    `Dear ${app.applicantName || 'Applicant'},`,
    '',
    `Reference: Personal Loan Application ID ${app.id}`,
    '',
    'Thank you for submitting your personal loan application with us. During our initial intake verification, we noticed that a few items require your attention before your file can proceed to underwriting:',
    '',
    ...bulletItemsEn.map((item, idx) => `${idx + 1}. ${item}`),
    '',
    'Please upload these documents or reply with the requested clarifications at your earliest convenience to avoid delays in processing your intake request.',
    '',
    'Best regards,',
    'Loan Intake Operations Team',
    '',
    'Disclaimer: This notification is an intake completeness request only. It does not constitute a loan approval, offer, credit evaluation, or lending commitment.',
  ].join('\n');
}
