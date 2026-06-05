import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import MovieCard from './MovieCard';
import MovieModal from './MovieModal';
import LanguageToggle from './LanguageToggle';
import { API_URL, getAuthHeaders, getAuthToken } from '../lib/api';
import { DEFAULT_LANGUAGE, getStoredLanguage, saveStoredLanguage } from '../lib/language';

const TEXT = {
  favorites: {
    title: { 'ko-KR': '내가 찜한 콘텐츠', 'en-US': 'My Favorites' },
    empty: { 'ko-KR': '아직 찜한 영화가 없습니다.', 'en-US': 'No favorite movies yet.' },
    remove: { 'ko-KR': '찜 해제', 'en-US': 'Remove' },
    endpoint: '/api/watchlist',
    dateField: 'added_at',
  },
  watched: {
    title: { 'ko-KR': '이미 본 영화', 'en-US': 'Watched Movies' },
    empty: { 'ko-KR': '아직 본 영화가 없습니다.', 'en-US': 'No watched movies yet.' },
    remove: { 'ko-KR': '기록 삭제', 'en-US': 'Remove' },
    endpoint: '/api/watch-history',
    dateField: 'watched_at',
  },
};

function toMovie(item) {
  return {
    tmdbId: item.movie_id,
    title: item.movie_title,
    posterUrl: item.poster_path,
    backdropUrl: item.poster_path,
    originalTitle: item.movie_title,
  };
}

export default function UserLibraryPage({ type, language = DEFAULT_LANGUAGE }) {
  const router = useRouter();
  const config = TEXT[type];
  const [activeLanguage, setActiveLanguage] = useState(language);
  const [currentUser, setCurrentUser] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setActiveLanguage(getStoredLanguage());

    const nickname = localStorage.getItem('nickname');
    const token = localStorage.getItem('token');
    if (nickname && token) {
      setCurrentUser(nickname);
    }
  }, []);

  useEffect(() => {
    saveStoredLanguage(activeLanguage);
  }, [activeLanguage]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!getAuthToken()) {
        setError(activeLanguage === 'ko-KR' ? '로그인이 필요한 페이지입니다.' : 'Please sign in to view this page.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}${config.endpoint}`, {
          headers: getAuthHeaders(),
        });
        setItems(response.data || []);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            (activeLanguage === 'ko-KR' ? '목록을 불러오지 못했습니다.' : 'Could not load this list.')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [config.endpoint, activeLanguage]);

  const handleRemove = async (movieId) => {
    try {
      await axios.delete(`${API_URL}${config.endpoint}/${movieId}`, {
        headers: getAuthHeaders(),
      });
      setItems((current) => current.filter((item) => item.movie_id !== movieId));
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          (activeLanguage === 'ko-KR' ? '삭제하지 못했습니다.' : 'Could not remove this movie.')
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-[80] bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/30 transition-all duration-300">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center">
          <Link
            href="/"
            className="absolute left-4 sm:left-6 text-2xl sm:text-3xl font-black tracking-tight drop-shadow-2xl transition-all duration-300"
          >
            Mood<span className="text-purple-500">Flick</span>
          </Link>

          <div className="ml-auto flex items-center gap-3 transition-all duration-300">
            {currentUser && (
              <span style={{ color: 'white', fontWeight: 'bold' }}>
                👤 {currentUser}
              </span>
            )}
            <Link
              href="/favorites"
              className={`px-4 py-2 h-10 border font-bold text-sm text-white rounded-full transition-all shadow-lg flex items-center ${
                type === 'favorites'
                  ? 'bg-purple-600 hover:bg-purple-500 border-transparent'
                  : 'bg-white/10 hover:bg-white/20 border-white/10'
              }`}
            >
              찜한 콘텐츠
            </Link>
            <Link
              href="/watched"
              className={`px-4 py-2 h-10 border font-bold text-sm text-white rounded-full transition-all shadow-lg flex items-center ${
                type === 'watched'
                  ? 'bg-purple-600 hover:bg-purple-500 border-transparent'
                  : 'bg-white/10 hover:bg-white/20 border-white/10'
              }`}
            >
              본 영화
            </Link>
            {currentUser && (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('nickname');
                  setCurrentUser(null);
                  router.push('/');
                }}
                className="px-5 py-2 h-10 bg-slate-700 hover:bg-slate-600 font-bold text-sm text-white rounded-full transition-all shadow-lg active:scale-95"
              >
                로그아웃
              </button>
            )}
            <LanguageToggle language={activeLanguage} setLanguage={setActiveLanguage} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black">
            {config.title[activeLanguage] || config.title['en-US']}
          </h1>
          <p className="mt-2 text-slate-400">
            {activeLanguage === 'ko-KR'
              ? '영화 상세 화면에서 추가한 콘텐츠가 여기에 모입니다.'
              : 'Movies added from the detail modal appear here.'}
          </p>
        </div>

        {loading && <p className="text-slate-400">{activeLanguage === 'ko-KR' ? '불러오는 중...' : 'Loading...'}</p>}
        {!loading && error && <p className="text-red-300">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <div className="border border-white/10 bg-slate-900/70 rounded-xl p-8 text-slate-300">
            {config.empty[activeLanguage] || config.empty['en-US']}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item) => {
              const movie = toMovie(item);
              return (
                <article key={item.id || item.movie_id} className="group">
                  <MovieCard movie={movie} onClick={() => setSelectedMovie(movie)} />
                  {item[config.dateField] && (
                    <p className="mt-3 text-xs text-slate-500 px-1">
                      {new Date(item[config.dateField]).toLocaleDateString()}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.movie_id)}
                    className="mt-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400/30 text-xs font-bold text-slate-300 hover:text-red-100 transition-colors"
                  >
                    {config.remove[activeLanguage] || config.remove['en-US']}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          language={activeLanguage}
        />
      )}
    </div>
  );
}
