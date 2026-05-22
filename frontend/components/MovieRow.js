import MovieCard from './MovieCard';

export default function MovieRow({ title, movies }) {
if (!movies || movies.length === 0) return null;

return (
    <div className="mb-12">
      {/* 테마 제목: 티빙 스타일의 세련되고 굵은 폰트 */}
    <h2 className="text-2xl font-bold text-white mb-4 px-2 tracking-tight flex items-center gap-2">
        <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
        {title}
    </h2>

      {/* 가로 스크롤 컨테이너: scrollbar-hide를 통해 스크롤바를 숨기고 부드러운 스크롤 지원 */}
    <div className="flex gap-6 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x scroll-smooth">
        {movies.map((movie, index) => (
        <div 
            key={movie.tmdbId || index} 
            className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start"
        >
            {/* 기존 MovieCard 재사용 */}
            <MovieCard movie={movie} />
        </div>
        ))}
    </div>

      {/* 간단한 스크롤바 커스텀 스타일링 (global.css에 넣어도 됨) */}
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