import { useEffect } from 'react';

export default function MovieModal({ movie, onClose, language }) {
  // 모달이 열리면 배경(body) 스크롤 방지
useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
}, []);

if (!movie) return null;

  // 가로 배경이 없으면 세로 포스터로 대체
const bgImage = movie.backdropUrl || movie.posterUrl || '/placeholder-poster.png';

return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 md:pt-12">
      {/* 어두운 뒷배경 (클릭 시 닫힘) */}
    <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer transition-opacity" 
        onClick={onClose} 
    />
    
      {/* 모달 본체 */}
    <div className="relative w-full max-w-4xl bg-[#181818] rounded-xl shadow-2xl z-10 overflow-y-auto scrollbar-hide max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* 우측 상단 닫기 (X) 버튼 */}
        <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-50 p-2 bg-[#181818]/60 hover:bg-[#181818] rounded-full text-white transition-all"
        >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        </button>

        {/* 🎬 상단 미디어 영역 (예고편 영상 / 배경 이미지) */}
        <div className="relative aspect-video w-full bg-slate-900">
        <img src={bgImage} className="w-full h-full object-cover" alt={movie.title} />
        
           {/* 하단 자연스러운 페이드 아웃 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/80 via-transparent to-transparent" />
        
           {/* 컨트롤 버튼 및 타이틀 오버레이 */}
        <div className="absolute bottom-[10%] left-6 sm:left-10 right-10">
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-6 drop-shadow-2xl line-clamp-2">
                {movie.title}
            </h1>
            
            <div className="flex items-center gap-3">
                {/* 1. 재생 (트레일러) 버튼 */}
                <button 
                onClick={() => alert('트레일러 재생 기능은 백엔드 API 연결 후 동작합니다!')}
                className="flex items-center gap-2 bg-white text-black px-4 sm:px-6 py-2 rounded-md font-bold text-base sm:text-lg hover:bg-white/80 transition-all active:scale-95"
                >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                재생
                </button>
                
                {/* 2. 관심 목록 (Wishlist) 추가 버튼 */}
                <button 
                onClick={() => alert('관심 목록(Wishlist)에 추가되었습니다!')}
                className="p-2 border-2 border-white/50 hover:border-white rounded-full bg-[#2a2a2a]/60 text-white transition-all active:scale-95 group" 
                title="내가 찜한 콘텐츠"
                >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                </button>
                
                {/* 3. 시청 기록 (Watched) 체크 버튼 */}
                <button 
                onClick={() => alert('시청 기록에 추가되었습니다!')}
                className="p-2 border-2 border-white/50 hover:border-white rounded-full bg-[#2a2a2a]/60 text-white transition-all active:scale-95" 
                title="이미 본 영화"
                >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                </button>
            </div>
        </div>
        </div>

        {/* 📝 하단 상세 정보 영역 */}
        <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
        <div className="col-span-2 space-y-5">
              {/* 메타 데이터 (매칭률, 개봉연도, 평점) */}
            <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base font-semibold flex-wrap">
                <span className="text-green-500">98% 일치</span>
                <span>{movie.releaseDate?.substring(0, 4)}</span>
                <span className="border border-white/40 px-1.5 py-0.5 rounded text-xs text-white/70">HD</span>
                <span className="flex items-center gap-1 text-yellow-500">
                    ★ {movie.rating?.toFixed(1)}
                </span>
            </div>
            
              {/* 영화 줄거리 */}
            <p className="text-sm sm:text-base leading-relaxed text-gray-200 font-light">
                {movie.overview || "상세 줄거리가 제공되지 않습니다."}
            </p>
            
              {/* AI 맞춤 추천 사유 (있을 경우만) */}
            {movie.recommendReason && (
                <div className="mt-4 p-4 bg-purple-900/30 border-l-4 border-purple-500 rounded-r-lg">
                    <p className="text-sm text-purple-200">
                    <span className="font-bold mr-2">✨ AI 추천 사유:</span> 
                    {movie.recommendReason}
                    </p>
                </div>
            )}
        </div>

           {/* 우측 부가 정보 */}
        <div className="col-span-1 space-y-4 text-sm text-gray-400">
            <p><span className="text-gray-500">원제:</span> <span className="text-gray-200">{movie.originalTitle}</span></p>
            <p><span className="text-gray-500">특징:</span> <span className="text-gray-200">흥미진진한, 감성적인</span></p>
        </div>
        </div>
    </div>
    </div>
);
}