import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { API_URL, getAuthHeaders, getAuthToken } from '../lib/api';

const TEXT = {
  'ko-KR': {
    loginRequired: '로그인이 필요한 기능입니다.',
    openList: '목록 페이지로 이동할까요?',
    duplicate: '이미 목록에 추가된 영화입니다.',
    serverError: '서버와 통신하는 중 오류가 발생했습니다.',
    trailerComingSoon: '트레일러 재생 기능은 향후 업데이트 예정입니다!',
    play: '재생',
    watchlistTitle: '관심 목록',
    watchedTitle: '이미 본 영화',
    watchlistAdded: '✨ 관심 목록에 추가되었습니다!',
    watchedAdded: '✔️ 시청 기록에 추가되었습니다!',
    noOverview: '상세 줄거리가 제공되지 않습니다.',
    aiReason: '✨ AI 추천 사유:',
    originalTitle: '원제:',
  },
  'en-US': {
    loginRequired: 'Please sign in to use this feature.',
    openList: 'Open the list page now?',
    duplicate: 'This movie is already in your list.',
    serverError: 'An error occurred while contacting the server.',
    trailerComingSoon: 'Trailer playback is planned for a future update.',
    play: 'Play',
    watchlistTitle: 'Watchlist',
    watchedTitle: 'Watched Movies',
    watchlistAdded: '✨ Added to your watchlist!',
    watchedAdded: '✔️ Added to watched history!',
    noOverview: 'No overview is available.',
    aiReason: '✨ AI recommendation reason:',
    originalTitle: 'Original title:',
  },
  'ja-JP': {
    loginRequired: 'この機能を使うにはログインが必要です。',
    openList: 'リストページに移動しますか？',
    duplicate: 'この映画はすでにリストに追加されています。',
    serverError: 'サーバーとの通信中にエラーが発生しました。',
    trailerComingSoon: '予告編再生機能は今後のアップデートで追加予定です。',
    play: '再生',
    watchlistTitle: 'ウォッチリスト',
    watchedTitle: '視聴済み',
    watchlistAdded: '✨ ウォッチリストに追加しました！',
    watchedAdded: '✔️ 視聴履歴に追加しました！',
    noOverview: 'あらすじは提供されていません。',
    aiReason: '✨ AIおすすめ理由:',
    originalTitle: '原題:',
  },
  'zh-CN': {
    loginRequired: '请先登录后再使用此功能。',
    openList: '现在打开列表页面吗？',
    duplicate: '这部电影已添加到列表中。',
    serverError: '与服务器通信时发生错误。',
    trailerComingSoon: '预告片播放功能将在后续更新中推出。',
    play: '播放',
    watchlistTitle: '观看清单',
    watchedTitle: '已观看电影',
    watchlistAdded: '✨ 已添加到观看清单！',
    watchedAdded: '✔️ 已添加到观看记录！',
    noOverview: '暂无详细剧情。',
    aiReason: '✨ AI 推荐理由:',
    originalTitle: '原标题:',
  },
};

export default function MovieModal({ movie, onClose, language }) {
  const router = useRouter();
  const text = TEXT[language] || TEXT['ko-KR'];
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    if (movie?.tmdbId) {
      const fetchTrailer = async () => {
        setTrailerLoading(true);
        try {
          const response = await axios.get(`${API_URL}/api/movies/${movie.tmdbId}/trailer`, {
            params: { language: language }
          });
          setTrailerUrl(response.data.trailer_url);
        } catch (error) {
          console.error("트레일러를 불러오는 데 실패했습니다:", error);
        } finally {
          setTrailerLoading(false);
        }
      };
      fetchTrailer();
    }
  }, [movie, language]);

  // 모달이 열리면 배경(body) 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!movie) return null;

  // 가로 배경이 없으면 세로 포스터로 대체
  const bgImage = movie.backdropUrl || movie.posterUrl || '/placeholder-poster.png';

  // 🚀 백엔드 API 호출 공통 함수 (관심 목록 / 시청 기록)
  const handleAddToList = async (endpoint, successMessage) => {
    const token = getAuthToken();
    if (!token) {
      alert(text.loginRequired);
      return;
    }

    try {
      await axios.post(`${API_URL}${endpoint}`, {
        movie_id: movie.tmdbId || movie.id, // tmdbId가 없으면 id라도 보내도록 방어!
        movie_title: movie.title || movie.originalTitle,
        poster_path: movie.posterUrl || movie.poster_path || '/placeholder-poster.png'
      }, { 
        headers: getAuthHeaders() 
      });
      
      const shouldOpenList = window.confirm(`${successMessage}\n\n${text.openList}`);
      
      if (shouldOpenList) {
        router.push(endpoint === '/api/watchlist' ? '/watchlist' : '/watched');
      } else {
        // 👇 2. 목록으로 이동하지 않고 머무를 경우 아이콘 상태를 true로 변경!
        if (endpoint === '/api/watchlist') setIsWatchlisted(true);
        if (endpoint === '/api/watch-history') setIsWatched(true);
      }
    } catch (error) {
      // 백엔드에서 409(Conflict - 중복) 에러를 보냈을 경우 처리
      if (error.response && error.response.status === 409) {
        alert(text.duplicate);
      } else {
        console.error('API 에러:', error);
        alert(text.serverError);
      }
    }
  };

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
          {/* 👇 showTrailer가 참이면 영상 띄우기, 거짓이면 기존 이미지 띄우기 */}
          {showTrailer && trailerUrl ? (
            <iframe 
            className="w-full h-full object-cover pointer-events-auto z-20 relative"
            src={`${trailerUrl}?autoplay=1&mute=0`} 
            title={`${movie.title} Trailer`}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            ></iframe>
          ) : (
          <img src={bgImage} className="w-full h-full object-cover" alt={movie.title} />
          )}
          {/* 하단 자연스러운 페이드 아웃 그라데이션 (기존 코드 유지) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent pointer-events-none" />
          
           {/* 컨트롤 버튼 오버레이 */}
          <div className="absolute bottom-[10%] left-6 sm:left-10 right-10">
              <h1 className="text-3xl sm:text-5xl font-black text-white mb-6 drop-shadow-2xl line-clamp-2">
                {movie.title}
              </h1>
              
              <div className="flex items-center gap-3">
                {/* 1. 재생 (트레일러) 버튼 */}
                <button
                  onClick={() => {
                    if (trailerLoading) {
                      return;
                    } else if (trailerUrl) {
                      setShowTrailer(!showTrailer);
                    } else {
                      alert('이 영화는 제공되는 예고편이 없습니다 🥲');
                    }
                  }}
                className="flex items-center gap-2 bg-white text-black px-4 sm:px-6 py-2 rounded-md font-bold text-base sm:text-lg hover:bg-white/80 transition-all active:scale-95">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  {trailerLoading ? '로딩 중...' : showTrailer ? '예고편 닫기' : '재생'}
                  </button>
                
                {/* 2. 관심 목록 (Wishlist) 추가 버튼 */}
                <button 
                onClick={() => handleAddToList('/api/watchlist', text.watchlistAdded)}
                // 👇 isWatchlisted 상태에 따라 보라색 배경으로 바뀜
                className={`p-2 border-2 rounded-full transition-all active:scale-95 group ${
                  isWatchlisted 
                  ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'border-white/50 hover:border-white bg-[#2a2a2a]/60 text-white'
                }`}
                title={text.watchlistTitle}
                >
                  {isWatchlisted ? (
                    // 추가 완료 시: 꽉 찬 하트 아이콘
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      ) : (
                        // 기본: 플러스 아이콘
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                        </button>
                        
                        {/* 3. 시청 기록 (Watched) 체크 버튼 */}
                        <button 
                        onClick={() => handleAddToList('/api/watch-history', text.watchedAdded)}
                        // 👇 isWatched 상태에 따라 파란색 배경으로 바뀜
                        className={`p-2 border-2 rounded-full transition-all active:scale-95 ${
                          isWatched 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'border-white/50 hover:border-white bg-[#2a2a2a]/60 text-white'
                        }`}
                        title={text.watchedTitle}
                        >
                          {isWatched ? (
                            // 추가 완료 시: 눈(Eye) 모양 아이콘
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                              ) : (
                                // 기본: 체크 아이콘
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                </button>
              </div>
            </div>
        </div>

        {/* 📝 하단 상세 정보 영역 */}
        <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
           <div className="col-span-2 space-y-5">
              <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base font-semibold flex-wrap">
                 <span>{movie.releaseDate?.substring(0, 4)}</span>
                 <span className="border border-white/40 px-1.5 py-0.5 rounded text-xs text-white/70">HD</span>
                 <span className="flex items-center gap-1 text-yellow-500">
                    ★ {movie.rating?.toFixed(1)}
                 </span>
              </div>
              
              <p className="text-sm sm:text-base leading-relaxed text-gray-200 font-light">
                {movie.overview || text.noOverview}
              </p>
              
              {movie.recommendReason && (
                 <div className="mt-4 p-4 bg-purple-900/30 border-l-4 border-purple-500 rounded-r-lg">
                    <p className="text-sm text-purple-200">
                      <span className="font-bold mr-2">{text.aiReason}</span> 
                      {movie.recommendReason}
                    </p>
                 </div>
              )}
           </div>

           <div className="col-span-1 space-y-4 text-sm text-gray-400">
              <p><span className="text-gray-500">{text.originalTitle}</span> <span className="text-gray-200">{movie.originalTitle}</span></p>
           </div>
        </div>
      </div>
    </div>
  );
}
