/**
 * Pure JavaScript geographic utilities for distance, bearing, and navigation lines.
 * Free, keyless, zero dependency.
 */

export interface BearingResult {
  degrees: number;
  cardinal: string;
  cardinalLong: string;
}

export interface LocalizedNavigationInfo {
  distanceKm: number;
  cardinal: string;
  cardinalLong: string;
  displayText: string;
}

const CARDINALS = [
  { short: 'N', long: 'North', min: 348.75, max: 11.25 },
  { short: 'NNE', long: 'North-Northeast', min: 11.25, max: 33.75 },
  { short: 'NE', long: 'Northeast', min: 33.75, max: 56.25 },
  { short: 'ENE', long: 'East-Northeast', min: 56.25, max: 78.75 },
  { short: 'E', long: 'East', min: 78.75, max: 101.25 },
  { short: 'ESE', long: 'East-Southeast', min: 101.25, max: 123.75 },
  { short: 'SE', long: 'Southeast', min: 123.75, max: 146.25 },
  { short: 'SSE', long: 'South-Southeast', min: 146.25, max: 168.75 },
  { short: 'S', long: 'South', min: 168.75, max: 191.25 },
  { short: 'SSW', long: 'South-Southwest', min: 191.25, max: 213.75 },
  { short: 'SW', long: 'Southwest', min: 213.75, max: 236.25 },
  { short: 'WSW', long: 'West-Southwest', min: 236.25, max: 258.75 },
  { short: 'W', long: 'West', min: 258.75, max: 281.25 },
  { short: 'WNW', long: 'West-Northwest', min: 281.25, max: 303.75 },
  { short: 'NW', long: 'Northwest', min: 303.75, max: 326.25 },
  { short: 'NNW', long: 'North-Northwest', min: 326.25, max: 348.75 },
];

// Localized translations for cardinal directions across supported Indian languages
export const CARDINAL_TRANSLATIONS: Record<string, Record<string, { short: string; long: string }>> = {
  hi: {
    N: { short: 'उ', long: 'उत्तर' },
    NNE: { short: 'उ-उ-पू', long: 'उत्तर-उत्तर-पूर्व' },
    NE: { short: 'उ-पू', long: 'उत्तर-पूर्व' },
    ENE: { short: 'पू-उ-पू', long: 'पूर्व-उत्तर-पूर्व' },
    E: { short: 'पू', long: 'पूर्व' },
    ESE: { short: 'पू-द-पू', long: 'पूर्व-दक्षिण-पूर्व' },
    SE: { short: 'द-पू', long: 'दक्षिण-पूर्व' },
    SSE: { short: 'द-द-पू', long: 'दक्षिण-दक्षिण-पूर्व' },
    S: { short: 'द', long: 'दक्षिण' },
    SSW: { short: 'द-द-प', long: 'दक्षिण-दक्षिण-पश्चिम' },
    SW: { short: 'द-प', long: 'दक्षिण-पश्चिम' },
    WSW: { short: 'प-द-प', long: 'पश्चिम-दक्षिण-पश्चिम' },
    W: { short: 'प', long: 'पश्चिम' },
    WNW: { short: 'प-उ-प', long: 'पश्चिम-उत्तर-पश्चिम' },
    NW: { short: 'उ-प', long: 'उत्तर-पश्चिम' },
    NNW: { short: 'उ-उ-प', long: 'उत्तर-उत्तर-पश्चिम' },
  },
  gu: {
    N: { short: 'ઉ', long: 'ઉત્તર' },
    NNE: { short: 'ઉ-ઉ-પૂ', long: 'ઉત્તર-ઉત્તર-પૂર્વ' },
    NE: { short: 'ઉ-પૂ', long: 'ઉત્તર-પૂર્વ' },
    ENE: { short: 'પૂ-ઉ-પૂ', long: 'પૂર્વ-ઉત્તર-પૂર્વ' },
    E: { short: 'પૂ', long: 'પૂર્વ' },
    ESE: { short: 'પૂ-દ-પૂ', long: 'પૂર્વ-દક્ષિણ-પૂર્વ' },
    SE: { short: 'દ-પૂ', long: 'દક્ષિણ-પૂર્વ' },
    SSE: { short: 'દ-દ-પૂ', long: 'દક્ષિણ-દક્ષિણ-પૂર્વ' },
    S: { short: 'દ', long: 'દક્ષિણ' },
    SSW: { short: 'દ-દ-પ', long: 'દક્ષિણ-દક્ષિણ-પશ્ચિમ' },
    SW: { short: 'દ-પ', long: 'દક્ષિણ-પશ્ચિમ' },
    WSW: { short: 'પ-દ-પ', long: 'પશ્ચિમ-દક્ષિણ-પશ્ચિમ' },
    W: { short: 'પ', long: 'પશ્ચિમ' },
    WNW: { short: 'પ-ઉ-પ', long: 'પશ્ચિમ-ઉત્તર-પશ્ચિમ' },
    NW: { short: 'ઉ-પ', long: 'ઉત્તર-પશ્ચિમ' },
    NNW: { short: 'ઉ-ઉ-પ', long: 'ઉત્તર-ઉત્તર-પશ્ચિમ' },
  },
  mr: {
    N: { short: 'उ', long: 'उत्तर' },
    NNE: { short: 'उ-उ-पू', long: 'उत्तर-उत्तर-पूर्व' },
    NE: { short: 'उ-पू', long: 'उत्तर-पूर्व' },
    ENE: { short: 'पू-उ-पू', long: 'पूर्व-उत्तर-पूर्व' },
    E: { short: 'पू', long: 'पूर्व' },
    ESE: { short: 'पू-द-पू', long: 'पूर्व-दक्षिण-पूर्व' },
    SE: { short: 'द-पू', long: 'दक्षिण-पूर्व' },
    SSE: { short: 'द-द-पू', long: 'दक्षिण-दक्षिण-पूर्व' },
    S: { short: 'द', long: 'दक्षिण' },
    SSW: { short: 'द-द-प', long: 'दक्षिण-दक्षिण-पश्चिम' },
    SW: { short: 'द-प', long: 'दक्षिण-पश्चिम' },
    WSW: { short: 'प-द-प', long: 'पश्चिम-दक्षिण-पश्चिम' },
    W: { short: 'प', long: 'पश्चिम' },
    WNW: { short: 'प-उ-प', long: 'पश्चिम-उत्तर-पश्चिम' },
    NW: { short: 'उ-प', long: 'उत्तर-पश्चिम' },
    NNW: { short: 'उ-उ-प', long: 'उत्तर-उत्तर-पश्चिम' },
  },
  bn: {
    N: { short: 'উ', long: 'উত্তর' },
    NNE: { short: 'উ-উ-পূ', long: 'উত্তর-উত্তর-পূর্ব' },
    NE: { short: 'উ-পূ', long: 'উত্তর-পূর্ব' },
    ENE: { short: 'পূ-উ-পূ', long: 'পূর্ব-উত্তর-পূর্ব' },
    E: { short: 'পূ', long: 'পূর্ব' },
    ESE: { short: 'পূ-দ-পূ', long: 'পূর্ব-দক্ষিণ-পূর্ব' },
    SE: { short: 'দ-পূ', long: 'দক্ষিণ-পূর্ব' },
    SSE: { short: 'দ-দ-পূ', long: 'দক্ষিণ-দক্ষিণ-পূর্ব' },
    S: { short: 'দ', long: 'দক্ষিণ' },
    SSW: { short: 'দ-দ-প', long: 'দক্ষিণ-দক্ষিণ-পশ্চিম' },
    SW: { short: 'দ-প', long: 'দক্ষিণ-পশ্চিম' },
    WSW: { short: 'প-দ-প', long: 'পশ্চিম-দক্ষিণ-পশ্চিম' },
    W: { short: 'প', long: 'পশ্চিম' },
    WNW: { short: 'প-উ-প', long: 'পশ্চিম-উত্তর-পশ্চিম' },
    NW: { short: 'উ-প', long: 'উত্তর-পশ্চিম' },
    NNW: { short: 'উ-উ-প', long: 'উত্তর-উত্তর-পশ্চিম' },
  },
  ta: {
    N: { short: 'வ', long: 'வடக்கு' },
    NNE: { short: 'வ-வ-கி', long: 'வட-வடகிழக்கு' },
    NE: { short: 'வ-கி', long: 'வடகிழக்கு' },
    ENE: { short: 'கி-வ-கி', long: 'கிழக்கு-வடகிழக்கு' },
    E: { short: 'கி', long: 'கிழக்கு' },
    ESE: { short: 'கி-தெ-கி', long: 'கிழக்கு-தென்கிழக்கு' },
    SE: { short: 'தெ-கி', long: 'தென்கிழக்கு' },
    SSE: { short: 'தெ-தெ-கி', long: 'தென்-தென்கிழக்கு' },
    S: { short: 'தெ', long: 'தெற்கு' },
    SSW: { short: 'தெ-தெ-மே', long: 'தென்-தென்மேற்கு' },
    SW: { short: 'தெ-மே', long: 'தென்மேற்கு' },
    WSW: { short: 'மே-தெ-மே', long: 'மேற்கு-தென்மேற்கு' },
    W: { short: 'மே', long: 'மேற்கு' },
    WNW: { short: 'மே-வ-மே', long: 'மேற்கு-வடமேற்கு' },
    NW: { short: 'வ-மே', long: 'வடமேற்கு' },
    NNW: { short: 'வ-வ-மே', long: 'வட-வடமேற்கு' },
  },
  te: {
    N: { short: 'ఉ', long: 'ఉత్తరం' },
    NNE: { short: 'ఉ-ఉ-తూ', long: 'ఉత్తర-ఈశాన్యం' },
    NE: { short: 'ఈ', long: 'ఈశాన్యం' },
    ENE: { short: 'తూ-ఉ-తూ', long: 'తూర్పు-ఈశాన్యం' },
    E: { short: 'తూ', long: 'తూర్పు' },
    ESE: { short: 'తూ-ద-తూ', long: 'తూర్పు-ఆగ్నేయం' },
    SE: { short: 'ఆ', long: 'ఆగ్నేయం' },
    SSE: { short: 'ద-ద-తూ', long: 'దక్షిణ-ఆగ్నేయం' },
    S: { short: 'ద', long: 'దక్షిణం' },
    SSW: { short: 'ద-ద-ప', long: 'దక్షిణ-నైరుతి' },
    SW: { short: 'నై', long: 'నైరుతి' },
    WSW: { short: 'ప-ద-ప', long: 'పశ్చిమ-నైరుతి' },
    W: { short: 'ప', long: 'పశ్చిమం' },
    WNW: { short: 'ప-ఉ-ప', long: 'పశ్చిమ-వాయువ్యం' },
    NW: { short: 'వా', long: 'వాయువ్యం' },
    NNW: { short: 'ఉ-ఉ-ప', long: 'ఉత్తర-వాయువ్యం' },
  },
  kn: {
    N: { short: 'ಉ', long: 'ಉತ್ತರ' },
    NNE: { short: 'ಉ-ಉ-ಪೂ', long: 'ಉತ್ತರ-ಈಶಾನ್ಯ' },
    NE: { short: 'ಈ', long: 'ಈಶಾನ್ಯ' },
    ENE: { short: 'ಪೂ-ಉ-ಪೂ', long: 'ಪೂರ್ವ-ಈಶಾನ್ಯ' },
    E: { short: 'ಪೂ', long: 'ಪೂರ್ವ' },
    ESE: { short: 'ಪೂ-ದ-ಪೂ', long: 'ಪೂರ್ವ-ಆಗ್ನೇಯ' },
    SE: { short: 'ಆ', long: 'ಆಗ್ನೇಯ' },
    SSE: { short: 'ದ-ದ-ಪೂ', long: 'ದಕ್ಷಿಣ-ಆಗ್ನೇಯ' },
    S: { short: 'ದ', long: 'ದಕ್ಷಿಣ' },
    SSW: { short: 'ದ-ದ-ಪ', long: 'ದಕ್ಷಿಣ-ನೈಋತ್ಯ' },
    SW: { short: 'ನೈ', long: 'ನೈಋತ್ಯ' },
    WSW: { short: 'ಪ-ದ-ಪ', long: 'ಪಶ್ಚಿಮ-ನೈಋತ್ಯ' },
    W: { short: 'ಪ', long: 'ಪಶ್ಚಿಮ' },
    WNW: { short: 'ಪ-ಉ-ಪ', long: 'ಪಶ್ಚಿಮ-ವಾಯುವ್ಯ' },
    NW: { short: 'ವಾ', long: 'ವಾಯುವ್ಯ' },
    NNW: { short: 'ಉ-ಉ-ಪ', long: 'ಉತ್ತರ-ವಾಯುವ್ಯ' },
  },
  pa: {
    N: { short: 'ਉ', long: 'ਉੱਤਰ' },
    NNE: { short: 'ਉ-ਉ-ਪੂ', long: 'ਉੱਤਰ-ਉੱਤਰ-ਪੂਰਬ' },
    NE: { short: 'ਉ-ਪੂ', long: 'ਉੱਤਰ-ਪੂਰਬ' },
    ENE: { short: 'ਪੂ-ਉ-ਪੂ', long: 'ਪੂਰਬ-ਉੱਤਰ-ਪੂਰਬ' },
    E: { short: 'ਪੂ', long: 'ਪੂਰਬ' },
    ESE: { short: 'ਪੂ-ਦ-ਪੂ', long: 'ਪੂਰਬ-ਦੱਖਣ-ਪੂਰਬ' },
    SE: { short: 'ਦ-ਪੂ', long: 'ਦੱਖਣ-ਪੂਰਬ' },
    SSE: { short: 'ਦ-ਦ-ਪੂ', long: 'ਦੱਖਣ-ਦੱਖਣ-ਪੂਰਬ' },
    S: { short: 'ਦ', long: 'ਦੱਖਣ' },
    SSW: { short: 'ਦ-ਦ-ਪ', long: 'ਦੱਖਣ-ਦੱਖਣ-ਪੱਛਮ' },
    SW: { short: 'ਦ-ਪ', long: 'ਦੱਖਣ-ਪੱਛਮ' },
    WSW: { short: 'ਪ-ਦ-ਪ', long: 'ਪੱਛਮ-ਦੱਖਣ-ਪੱਛਮ' },
    W: { short: 'ਪ', long: 'ਪੱਛਮ' },
    WNW: { short: 'ਪ-ਉ-ਪ', long: 'ਪੱਛਮ-ਉੱਤਰ-ਪੱਛਮ' },
    NW: { short: 'ਉ-ਪ', long: 'ਉੱਤਰ-ਪੱਛਮ' },
    NNW: { short: 'ਉ-ਉ-ਪ', long: 'ਉੱਤਰ-ਉੱਤਰ-ਪੱਛਮ' },
  },
  ur: {
    N: { short: 'ش', long: 'شمال' },
    NNE: { short: 'ش-ش-م', long: 'شمال-شمال-مشرق' },
    NE: { short: 'ش-م', long: 'شمال-مشرق' },
    ENE: { short: 'م-ش-م', long: 'مشرق-شمال-مشرق' },
    E: { short: 'م', long: 'مشرق' },
    ESE: { short: 'م-ج-م', long: 'مشرق-جنوب-مشرق' },
    SE: { short: 'ج-م', long: 'جنوب-مشرق' },
    SSE: { short: 'ج-ج-م', long: 'جنوب-جنوب-مشرق' },
    S: { short: 'ج', long: 'جنوب' },
    SSW: { short: 'ج-ج-مغ', long: 'جنوب-جنوب-مغرب' },
    SW: { short: 'ج-مغ', long: 'جنوب-مغرب' },
    WSW: { short: 'مغ-ج-مغ', long: 'مغرب-جنوب-مغرب' },
    W: { short: 'مغ', long: 'مغرب' },
    WNW: { short: 'مغ-ش-مغ', long: 'مغرب-شمال-مغرب' },
    NW: { short: 'ش-مغ', long: 'شمال-مغرب' },
    NNW: { short: 'ش-ش-مغ', long: 'شمال-شمال-مغرب' },
  },
};

/**
 * Calculates Great-Circle distance between two points in Kilometers using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculates initial forward compass bearing from origin (lat1, lon1) to target (lat2, lon2)
 */
export function calculateCompassBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): BearingResult {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLambda = toRad(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let theta = Math.atan2(y, x);
  let degrees = ((theta * 180) / Math.PI + 360) % 360;
  degrees = Math.round(degrees * 10) / 10;

  let cardinal = 'N';
  let cardinalLong = 'North';

  for (const c of CARDINALS) {
    if (c.min > c.max) {
      if (degrees >= c.min || degrees < c.max) {
        cardinal = c.short;
        cardinalLong = c.long;
        break;
      }
    } else if (degrees >= c.min && degrees < c.max) {
      cardinal = c.short;
      cardinalLong = c.long;
      break;
    }
  }

  return { degrees, cardinal, cardinalLong };
}

/**
 * Formats navigation vector guidance with full language translation support
 */
export function formatZoneNavigationText(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  lang: string = 'en',
  formatNumFn?: (v: number | string) => string
): LocalizedNavigationInfo {
  const distanceKm = calculateHaversineDistance(userLat, userLng, targetLat, targetLng);
  const bearing = calculateCompassBearing(userLat, userLng, targetLat, targetLng);
  
  const trans = CARDINAL_TRANSLATIONS[lang]?.[bearing.cardinal];
  const cardinalLong = trans ? trans.long : bearing.cardinalLong;
  const cardinalShort = trans ? trans.short : bearing.cardinal;
  const distStr = formatNumFn ? formatNumFn(distanceKm) : String(distanceKm);

  let displayText = `Zone is ${distStr} km ${cardinalLong} (${bearing.cardinal}) of your location`;

  switch (lang) {
    case 'hi':
      displayText = `ज़ोन आपके स्थान से ${distStr} किमी ${cardinalLong} (${bearing.cardinal}) में है`;
      break;
    case 'gu':
      displayText = `ઝોન તમારા સ્થાનથી ${distStr} કિમી ${cardinalLong} (${bearing.cardinal}) માં છે`;
      break;
    case 'mr':
      displayText = `झोन तुमच्या स्थानापासून ${distStr} किमी ${cardinalLong} (${bearing.cardinal}) आहे`;
      break;
    case 'bn':
      displayText = `জোন আপনার অবস্থান থেকে ${distStr} কিমি ${cardinalLong} (${bearing.cardinal}) দূরে`;
      break;
    case 'ta':
      displayText = `மண்டலம் உங்கள் இடத்திலிருந்து ${distStr} கி.மீ ${cardinalLong} (${bearing.cardinal}) தொலைவில் உள்ளது`;
      break;
    case 'te':
      displayText = `జోన్ మీ స్థానం నుండి ${distStr} కి.మీ ${cardinalLong} (${bearing.cardinal}) లో ఉంది`;
      break;
    case 'kn':
      displayText = `ವಲಯವು ನಿಮ್ಮ ಸ್ಥಳದಿಂದ ${distStr} ಕಿಮೀ ${cardinalLong} (${bearing.cardinal}) ನಲ್ಲಿದೆ`;
      break;
    case 'pa':
      displayText = `ਜ਼ੋਨ ਤੁਹਾਡੇ ਸਥਾਨ ਤੋਂ ${distStr} ਕਿਮੀ ${cardinalLong} (${bearing.cardinal}) ਵਿੱਚ ਹੈ`;
      break;
    case 'ur':
      displayText = `زون آپ کے مقام سے ${distStr} کلومیٹر ${cardinalLong} (${bearing.cardinal}) پر ہے`;
      break;
  }

  return {
    distanceKm,
    cardinal: cardinalShort,
    cardinalLong,
    displayText,
  };
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

