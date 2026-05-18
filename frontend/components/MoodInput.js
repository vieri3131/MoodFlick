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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto my-4">
        <textarea
        /* 👇 이 부분의 디자인(className)을 다크 테마에 맞게 싹 바꿨습니다! 👇 */
        className="w-full p-4 text-lg bg-slate-800/60 text-white placeholder-slate-400 border border-slate-600 rounded-xl focus:border-purple-500 focus:bg-slate-800 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none shadow-inner"
        rows="3"
        placeholder={isKorean ? "지금 기분을 말해주세요... (예: 비가 와서 조금 울적해)" : "How are you feeling? (e.g. A bit sad because it's raining)"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        />
        <button
        type="submit"
        disabled={loading}
        /* 👇 버튼도 티빙/넷플릭스 감성의 그라데이션으로 업그레이드했습니다 👇 */
        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 transition-all shadow-lg hover:shadow-purple-500/25"
        >
        {loading 
            ? (isKorean ? 'AI가 분석 중입니다...' : 'AI is analyzing...') 
            : (isKorean ? '맞춤 영화 추천받기' : 'Get Movie Recommendations')}
        </button>
    </form>
    );
}