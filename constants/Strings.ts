// constants/Strings.ts
// Add more languages here later (Kannada, Tamil, etc.)

type Lang = 'en' | 'hi';

const strings = {
  en: {
    // Navigation
    myVillages:     'My Villages',
    whoAreYou:      'Who are you?',
    // Home
    addVillage:     '+ Add Village',
    patients:       'patients',
    // Village
    addHousehold:   '+ Add Household',
    members:        'members',
    // Household
    addPatient:     '+ Add Patient',
    noVisits:       'No visits recorded',
    overdue:        'Overdue',
    alert:          '⚠ Alert',
    // Person
    recordVisit:    '+ Record Visit',
    visitsRecorded: 'visits recorded',
    // Forms
    savePerson:     'Save Patient',
    saveVisit:      'Save Visit',
    saveVillage:    'Save Village',
    saveHousehold:  'Save Household',
    name:           'Full Name',
    age:            'Age',
    gender:         'Gender',
    bp:             'Systolic Blood Pressure',
    weight:         'Weight',
    autofillGps:    'Auto-fill District & State via GPS',
    villageName:    'Village Name',
    block:          'Block / Taluk',
    district:       'District',
    state:          'State',
    headOfHousehold:'Head of Household',
    address:        'Address / House No.',
    totalMembers:   'Total Members',
    syncNote:       'Saved offline. Will sync when connected.',
    highBpWarning:  'BP above 140 mmHg — flagged for follow-up.',
    lastVisit:      'Last',
    noVillages:     'No villages yet',
    noVillagesHint: 'Tap "Add Village" to get started.',
    noHouseholds:   'No households yet',
    noPatients:     'No patients yet',
    switch:         'Switch',
    registerContinue: 'Register & Continue',
    phone:          'Phone Number',
    selectName:     'Select your name or register below.',
  },
  hi: {
    // Navigation
    myVillages:     'मेरे गाँव',
    whoAreYou:      'आप कौन हैं?',
    // Home
    addVillage:     '+ गाँव जोड़ें',
    patients:       'मरीज़',
    // Village
    addHousehold:   '+ घर जोड़ें',
    members:        'सदस्य',
    // Household
    addPatient:     '+ मरीज़ जोड़ें',
    noVisits:       'कोई दौरा दर्ज नहीं',
    overdue:        'देर हो गई',
    alert:          '⚠ चेतावनी',
    // Person
    recordVisit:    '+ दौरा दर्ज करें',
    visitsRecorded: 'दौरे दर्ज हुए',
    // Forms
    savePerson:     'मरीज़ सहेजें',
    saveVisit:      'दौरा सहेजें',
    saveVillage:    'गाँव सहेजें',
    saveHousehold:  'घर सहेजें',
    name:           'पूरा नाम',
    age:            'उम्र',
    gender:         'लिंग',
    bp:             'सिस्टोलिक रक्तचाप',
    weight:         'वज़न',
    autofillGps:    '📍 GPS से जिला और राज्य भरें',
    villageName:    'गाँव का नाम',
    block:          'ब्लॉक / तालुक',
    district:       'जिला',
    state:          'राज्य',
    headOfHousehold:'घर के मुखिया का नाम',
    address:        'पता / मकान नंबर',
    totalMembers:   'कुल सदस्य',
    syncNote:       'ऑफलाइन सहेजा गया। कनेक्शन होने पर सिंक होगा।',
    highBpWarning:  'BP 140 से ज़्यादा — फॉलो-अप के लिए चिह्नित।',
    lastVisit:      'आखिरी दौरा',
    noVillages:     'कोई गाँव नहीं',
    noVillagesHint: '"गाँव जोड़ें" दबाएं।',
    noHouseholds:   'कोई घर नहीं',
    noPatients:     'कोई मरीज़ नहीं',
    switch:         'बदलें',
    registerContinue: 'दर्ज करें और जारी रखें',
    phone:          'फ़ोन नंबर',
    selectName:     'अपना नाम चुनें या नीचे दर्ज करें।',
  },
};

export type StringKey = keyof typeof strings.en;
export { strings };
export type { Lang };