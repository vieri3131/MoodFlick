import { useState, useRef, useEffect } from 'react';

export default function SearchBar({ language, onSearch }) {
const [isExpanded, setIsExpanded] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const containerRef = useRef(null);

  // 언어별 입력창 안내 문구(Placeholder)
const placeholders = {
    'ko-KR': '영화 제목 검색...',
    'en-US': 'Search movies...',
    'ja-JP': '映画を検索...',
    'zh-CN': '搜索电影...'
};

const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
    onSearch(searchTerm);
      setSearchTerm(''); // 검색 후 입력창 비우기
    }
};

useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

return (
    <div
    ref={containerRef}
    className="relative flex items-center h-10 group"
    >
    <form
        onSubmit={handleSubmit}
        className={`flex items-center h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full transition-all duration-500 overflow-hidden ${
        isExpanded ? 'w-64 px-4 bg-white/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'w-10 px-0 justify-center'
        }`}
    >
        {/* 돋보기 아이콘 */}
        <button type="submit" onClick={() => setIsExpanded(prev => !prev)} className="text-white shrink-0 outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        </button>

        {/* 입력 필드 (마우스를 올렸을 때만 너비가 커지며 나타남) */}
        <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholders[language] || placeholders['ko-KR']}
        className={`bg-transparent border-none outline-none text-sm text-white ml-2 transition-opacity duration-300 placeholder:text-slate-300 ${
            isExpanded ? 'opacity-100 w-full' : 'opacity-0 w-0'
        }`}
        />
    </form>
    </div>
);
}
