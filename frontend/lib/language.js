export const DEFAULT_LANGUAGE = 'ko-KR';
export const LANGUAGE_STORAGE_KEY = 'moodflick-language';

export function getStoredLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE;
}

export function saveStoredLanguage(language) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}
