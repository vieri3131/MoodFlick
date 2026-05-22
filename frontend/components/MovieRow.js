import { useRef, useState } from 'react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies }) {
const scrollRef = useRef(null);
const [isDown, setIsDown] = useState(false);
const [startX, setStartX] = useState(0);
const [scrollLeft, setScrollLeft] = useState(0);

  // 1. 마우스 드래그 기능 (기존 유지)
const handleMouseDown = (e) => {
    setIsDown(true);
    scrollRef.current.classList.add('cursor-grabbing');
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
};

const handleMouseLeave = () => {
    setIsDown(false);
    scrollRef.current.classList.remove('cursor-grabbing');
};

const handleMouseUp = () => {
    setIsDown(false);
    scrollRef.current.classList.remove('cursor-grabbing');
};

const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
};

  // 2. 👇 좌우 버튼 클릭 시 부드럽게 스크롤 이동하는 함수 추가
const scroll = (direction) => {
    if (scrollRef.current) {
    const { scrollLeft, clientWidth } = scrollRef.current;
      // 사용자의 현재 화면 너비(clientWidth)의 80% 만큼씩 이동하여 자연스럽게 넘어가도록 계산
    const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;

    scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth' // 부드러운 애니메이션 효과
    });
    }
};

if (!movies || movies.length === 0) return null;

return (
    // group 클래스를 주어 가로줄 전체에 마우스를 올렸을(hover) 때만 양끝 버튼이 나타나도록 설계 (넷플릭스 스타일)
    <div className="mb-12 relative group">
    <h2 className="text-2xl font-bold text-white mb-4 px-2 tracking-tight flex items-center gap-2">
        <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
        {title}
    </h2>

      {/* 버튼 배치를 위한 relative 컨테이너 */}
    <div className="relative">
        
        {/* ◀ 왼쪽 화살표 버튼 */}
        <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-0 bottom-4 my-auto z-40 w-12 h-24 bg-black/60 hover:bg-black/90 hover:scale-105 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm rounded-r-xl border-y border-r border-white/10 shadow-lg"
        aria-label="Scroll Left"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        </button>

        {/* 영화 카드들이 담긴 스크롤 영역 */}
        <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x scroll-smooth cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        >
        {movies.map((movie, index) => (
            <div 
            key={movie.tmdbId || index} 
            className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start"
            >
            <MovieCard movie={movie} />
            </div>
        ))}
        </div>

        {/* ▶ 오른쪽 화살표 버튼 */}
        <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-0 bottom-4 my-auto z-40 w-12 h-24 bg-black/60 hover:bg-black/90 hover:scale-105 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm rounded-l-xl border-y border-l border-white/10 shadow-lg"
        aria-label="Scroll Right"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        </button>

    </div>

    <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
        display: none;
        }
        .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
        }
    `}</style>
    </div>
);
}