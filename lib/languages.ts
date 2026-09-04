export interface LanguageItem {
  id: string;
  name: string;
  nativeName: string; // Native script display name for language selection
  native: string;     // Brand name in native script
  code: string;
}

export const JALSANKET_LANGUAGES: LanguageItem[] = [
  { id: 'en', name: 'English',  nativeName: 'English',  native: 'JalSanket', code: 'en' },
  { id: 'hi', name: 'Hindi',    nativeName: 'हिन्दी',   native: 'जल संकेत', code: 'hi' },
  { id: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', native: 'જલ સંકેત', code: 'gu' },
  { id: 'mr', name: 'Marathi',  nativeName: 'मराठी',   native: 'जल संकेत', code: 'mr' },
  { id: 'bn', name: 'Bengali',  nativeName: 'বাংলা',   native: 'জল সংকেত', code: 'bn' },
  { id: 'ta', name: 'Tamil',    nativeName: 'தமிழ்',   native: 'ஜல் சங்கேத்', code: 'ta' },
  { id: 'te', name: 'Telugu',   nativeName: 'తెలుగు',  native: 'జల్ సంకేత్', code: 'te' },
  { id: 'kn', name: 'Kannada',  nativeName: 'ಕನ್ನಡ',   native: 'ಜಲ್ ಸಂಕೇತ್', code: 'kn' },
  { id: 'pa', name: 'Punjabi',  nativeName: 'ਪੰਜਾਬੀ',  native: 'ਜਲ ਸੰਕੇਤ', code: 'pa' },
  { id: 'ur', name: 'Urdu',     nativeName: 'اردو',     native: 'جل سنکیت', code: 'ur' },
];
