export default function MovieCard({ movie }) {
ㄴreturn (
    <div className="group relative bg-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)] cursor-pointer">
    
      {/* 포스터 영역 (비율 유지) */}
    <div className="relative aspect-[2/3] w-full">
        <img
        src={movie.posterUrl || '/placeholder-poster.png'}
        alt={movie.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* 하단 정보 보호용 다크 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80" />
    </div>

      {/* 정보 텍스트 영역 (카드 하단에 고정) */}
    <div className="absolute bottom-0 w-full p-5 flex flex-col justify-end">
        <h3 className="text-white font-bold text-xl mb-1 truncate drop-shadow-md">
        {movie.title}
        </h3>
        <div className="flex items-center gap-2 mb-3">
        <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
            ★ {movie.rating?.toFixed(1)}
        </span>
        </div>
        
        {/* AI 추천 이유: 마우스를 올렸을 때만 스르륵 나타나는 효과 */}
        <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300">
        <p className="text-sm text-gray-300 leading-snug line-clamp-3">
            "{movie.recommendReason}"
        </p>
        </div>
    </div>
    </div>
);
}