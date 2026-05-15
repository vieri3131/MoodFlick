import { useState } from 'react';

export default function MoodInput({ onSearch, loading, language }) {
const [text, setText] = useState('');

const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSearch(text);
};

const isKorean = language === 'ko-KR';

return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto my-8">
    <textarea
        className="w-full p-4 text-lg border-2 border-purple-200 rounded-xl focus:border-purple-500 outline-none transition-all"
        rows="3"
        placeholder={isKorean ? "지금 기분을 말해주세요... (예: 비가 와서 조금 울적해)" : "How are you feeling? (e.g. A bit sad because it's raining)"}
        value={text}
        onChange={(e) => setText(e.target.value)}
    />
    <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
    >
        {loading 
        ? (isKorean ? 'AI가 분석 중입니다...' : 'AI is analyzing...') 
        : (isKorean ? '맞춤 영화 추천받기' : 'Get Movie Recommendations')}
    </button>
    </form>
);
}