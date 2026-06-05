import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import MovieModal from './MovieModal';
import { API_URL, getAuthHeaders, getAuthToken } from '../lib/api';

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

export default function UserLibraryPage({ type, language = 'ko-KR' }) {
  const config = TEXT[type];
  const [items, setItems] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      if (!getAuthToken()) {
        setError(language === 'ko-KR' ? '로그인이 필요한 페이지입니다.' : 'Please sign in to view this page.');
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
            (language === 'ko-KR' ? '목록을 불러오지 못했습니다.' : 'Could not load this list.')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [config.endpoint, language]);

  const handleRemove = async (movieId) => {
    try {
      await axios.delete(`${API_URL}${config.endpoint}/${movieId}`, {
        headers: getAuthHeaders(),
      });
      setItems((current) => current.filter((item) => item.movie_id !== movieId));
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          (language === 'ko-KR' ? '삭제하지 못했습니다.' : 'Could not remove this movie.')
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/95 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-3xl font-black tracking-tight">
            Mood<span className="text-purple-500">Flick</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm font-bold">
            <Link href="/favorites" className={`px-4 py-2 rounded-full border ${type === 'favorites' ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/10 text-slate-300 hover:text-white hover:border-white/30'}`}>
              {TEXT.favorites.title[language] || TEXT.favorites.title['en-US']}
            </Link>
            <Link href="/watched" className={`px-4 py-2 rounded-full border ${type === 'watched' ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/10 text-slate-300 hover:text-white hover:border-white/30'}`}>
              {TEXT.watched.title[language] || TEXT.watched.title['en-US']}
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black">
            {config.title[language] || config.title['en-US']}
          </h1>
          <p className="mt-2 text-slate-400">
            {language === 'ko-KR'
              ? '영화 상세 화면에서 추가한 콘텐츠가 여기에 모입니다.'
              : 'Movies added from the detail modal appear here.'}
          </p>
        </div>

        {loading && <p className="text-slate-400">{language === 'ko-KR' ? '불러오는 중...' : 'Loading...'}</p>}
        {!loading && error && <p className="text-red-300">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <div className="border border-white/10 bg-slate-900/70 rounded-xl p-8 text-slate-300">
            {config.empty[language] || config.empty['en-US']}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {items.map((item) => {
              const movie = toMovie(item);
              return (
                <article key={item.id || item.movie_id} className="group">
                  <button
                    type="button"
                    onClick={() => setSelectedMovie(movie)}
                    className="block w-full text-left rounded-lg overflow-hidden bg-slate-900 border border-white/10 hover:border-purple-500/60 transition-all"
                  >
                    <div className="aspect-[2/3] bg-slate-800">
                      <img
                        src={movie.posterUrl || '/placeholder-poster.png'}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h2 className="font-bold text-sm truncate">{movie.title}</h2>
                      {item[config.dateField] && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(item[config.dateField]).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.movie_id)}
                    className="mt-2 w-full py-2 rounded-md bg-white/5 hover:bg-red-500/20 text-xs font-bold text-slate-300 hover:text-red-100 transition-colors"
                  >
                    {config.remove[language] || config.remove['en-US']}
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
          language={language}
        />
      )}
    </div>
  );
}
