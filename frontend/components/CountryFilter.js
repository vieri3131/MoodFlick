export default function CountryFilter({ value, onChange }) {
const countries = [
    { code: 'KR', name: '한국 🇰🇷' },
    { code: 'US', name: '미국 🇺🇸' },
    { code: 'ID', name: '인도네시아 🇮🇩' },
    { code: 'JP', name: '일본 🇯🇵' }
];

return (
    <div className="flex gap-2 justify-center mb-6">
    {countries.map((c) => (
        <button
        key={c.code}
        onClick={() => onChange(c.code)}
        className={`px-4 py-1 rounded-full text-sm font-medium border transition-colors ${
            value === c.code ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
        }`}
        >
        {c.name}
        </button>
    ))}
    </div>
);
}