import { useState, useRef, useEffect } from 'react';

export default function LanguageToggle({ language, setLanguage }) {
const [isOpen, setIsOpen] = useState(false);
const dropdownRef = useRef(null);

  // 4개국어 지원 배열
const languages = [
    { code: 'ko-KR', label: '한국어', flag: '🇰🇷' },
    { code: 'en-US', label: 'English', flag: '🇺🇸' },
    { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', label: '中文', flag: '🇨🇳' }
];

const currentLang = languages.find(l => l.code === language) || languages[0];

  // 드롭다운 외부 클릭 시 닫히도록 처리
useEffect(() => {
    const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
    }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

return (
    <div className="relative" ref={dropdownRef}>
    <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full backdrop-blur-md text-sm font-bold text-white transition-all shadow-lg"
    >
        <span>{currentLang.flag}</span>
        <span>{currentLang.label}</span>
        <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    </button>

      {/* 드롭다운 메뉴 */}
    {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
        {languages.map((lang) => (
            <button
            key={lang.code}
            onClick={() => { 
                setLanguage(lang.code); 
                setIsOpen(false); 
            }}
            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${
                language === lang.code ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
            >
            <span>{lang.flag}</span>
            {lang.label}
            </button>
        ))}
        </div>
    )}
    </div>
);
}