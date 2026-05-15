export default function LanguageToggle({ language, setLanguage }) {
const toggleLanguage = () => {
    setLanguage(language === 'ko-KR' ? 'en-US' : 'ko-KR');
};

return (
    <div className="flex justify-end mb-2">
    <button
        onClick={toggleLanguage}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
    >
        {language === 'ko-KR' ? '🇺🇸 English (US)' : '🇰🇷 한국어'}
    </button>
    </div>
);
}