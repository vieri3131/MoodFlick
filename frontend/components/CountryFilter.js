export default function CountryFilter({ value, onChange, language }) {
  // 현재 선택된 언어가 한국어인지 확인
const isKorean = language === 'ko-KR';

  // 언어에 따라 표시될 국가 이름 설정
const countries = [
    { code: 'KR', name: isKorean ? '한국 🇰🇷' : 'Korea 🇰🇷' },
    { code: 'US', name: isKorean ? '미국 🇺🇸' : 'USA 🇺🇸' },
    { code: 'ID', name: isKorean ? '인도네시아 🇮🇩' : 'Indonesia 🇮🇩' },
    { code: 'JP', name: isKorean ? '일본 🇯🇵' : 'Japan 🇯🇵' }
];

return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
    {countries.map((c) => (
        <button
        key={c.code}
        onClick={() => onChange(c.code)}
        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 ${
            value === c.code 
            ? 'bg-purple-600 text-white border-purple-600 shadow-md transform scale-105' 
            : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
        }`}
        >
        {c.name}
        </button>
    ))}
    </div>
);
}