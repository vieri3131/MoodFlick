import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import MoodInput from '../components/MoodInput';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import CountryFilter from '../components/CountryFilter';
import LanguageToggle from '../components/LanguageToggle';
import AuthModal from '../components/AuthModal';
import SearchBar from '../components/SearchBar';
import MovieModal from '../components/MovieModal';
import UserMenu from '../components/UserMenu';
import { API_URL } from '../lib/api';
import { DEFAULT_LANGUAGE, getStoredLanguage, saveStoredLanguage } from '../lib/language';

// 🎭 감정 테마 (4개국어 지원)
export const EMOTION_LABELS = {
  happy: '행복',
  sad: '슬픔',
  angry: '분노',
  romantic: '설렘',
  scary: '무서움',
  excited: '신남',
  calm: '평온함',
  lonely: '외로움',
  tired: '피곤함',
  bored: '지루함',
  confused: '혼란',
  nostalgic: '그리움',
  empty: '허무함',
  frustrated: '답답함',
  regretful: '후회',
};

const EMOTION_THEMES = [
  { id: 'happy', genreId: 35, title: { 'ko-KR': '😊 기분 좋은 하루! 유쾌한 코미디', 'en-US': '😊 Feel Good Comedies', 'ja-JP': '😊 気分爽快！愉快なコメディ', 'zh-CN': '😊 心情愉悦！欢乐喜剧' } },
  { id: 'sad', genreId: 18, title: { 'ko-KR': '😢 마음을 건드리는 감성 드라마', 'en-US': '😢 Emotional & Touching', 'ja-JP': '😢 心に響く感動のドラマ', 'zh-CN': '😢 触动人心的情感剧情' } },
  { id: 'angry', genreId: 28, title: { 'ko-KR': '🔥 스트레스 타파! 화끈한 액션', 'en-US': '🔥 Stress Buster Action', 'ja-JP': '🔥 ストレス発散！爽快アクション', 'zh-CN': '🔥 释放压力！火爆动作' } },
  { id: 'romantic', genreId: 10749, title: { 'ko-KR': '💕 설렘 가득, 달콤한 로맨스', 'en-US': '💕 Romantic & Sweet', 'ja-JP': '💕 ときめき、甘いロマンス', 'zh-CN': '💕 怦然心动，甜蜜浪漫' } },
  { id: 'scary', genreId: 27, title: { 'ko-KR': '👻 오싹한 긴장감, 공포/스릴러', 'en-US': '👻 Chilling Horror', 'ja-JP': '👻 ゾッとする緊張感、ホラー', 'zh-CN': '👻 令人毛骨悚然，恐怖/惊悚' } },
  { id: 'excited', genreId: 12, title: { 'ko-KR': '🤩 심장 쫄깃! 흥미진진 어드벤처', 'en-US': '🤩 Exciting Adventures', 'ja-JP': '🤩 ドキドキのアド벤처', 'zh-CN': '🤩 惊心动魄！刺激冒险' } },
  { id: 'calm', genreId: 10751, title: { 'ko-KR': '☕ 차분하게 즐기는 힐링 영화', 'en-US': '☕ Calming Family Movies', 'ja-JP': '☕ 穏やかに楽しむ癒し映画', 'zh-CN': '☕ 平静放松的治愈系电影' } },
  { id: 'lonely', genreId: 10402, title: { 'ko-KR': '🌙 외로움을 달래주는 음악', 'en-US': '🌙 Comforting Music Movies', 'ja-JP': '🌙 孤独を癒す音楽・ミュージカル', 'zh-CN': '🌙 抚慰孤独的音乐电影' } },
  { id: 'tired', genreId: 16, title: { 'ko-KR': '🥱 지친 하루의 끝, 애니메이션', 'en-US': '🥱 Relaxing Animations', 'ja-JP': '🥱 疲れた一日の終わりに、アニメ', 'zh-CN': '🥱 疲惫的一天结束，治愈动画' } },
  { id: 'bored', genreId: 878, title: { 'ko-KR': '🍿 상상력 폭발, SF 판타지', 'en-US': '🍿 Fun Sci-Fi & Fantasy', 'ja-JP': '🍿 想像力の世界へ、SFファンタジー', 'zh-CN': '🍿 奇妙想象，科幻/奇幻' } },
  { id: 'confused', genreId: 18, title: { 'ko-KR': '🌿 복잡한 생각을 쉬게 하는 힐링 드라마', 'en-US': '🌿 Gentle Movies for a Tangled Mind', 'ja-JP': '🌿 複雑な気持ちを休める癒しドラマ', 'zh-CN': '🌿 让复杂思绪休息的治愈剧情' } },
  { id: 'nostalgic', genreId: 10749, title: { 'ko-KR': '📷 그리운 시간을 떠올리는 감성 영화', 'en-US': '📷 Nostalgic Romance & Drama', 'ja-JP': '📷 懐かしい時間を思い出す感性映画', 'zh-CN': '📷 唤起怀旧时光的情感电影' } },
  { id: 'empty', genreId: 18, title: { 'ko-KR': '🕯 허무한 마음에 의미를 건네는 드라마', 'en-US': '🕯 Reflective Life Dramas', 'ja-JP': '🕯 空虚な心に意味を届けるドラマ', 'zh-CN': '🕯 为空虚内心带来意义的剧情片' } },
  { id: 'frustrated', genreId: 28, title: { 'ko-KR': '⚡ 답답함을 풀어주는 통쾌한 액션', 'en-US': '⚡ Cathartic Action & Comebacks', 'ja-JP': '⚡ もどかしさを晴らす爽快アクション', 'zh-CN': '⚡ 释放郁闷的爽快动作' } },
  { id: 'regretful', genreId: 18, title: { 'ko-KR': '🔁 후회를 딛고 다시 나아가는 성장 영화', 'en-US': '🔁 Stories of Growth and Second Chances', 'ja-JP': '🔁 後悔を越えて進む成長映画', 'zh-CN': '🔁 跨越后悔重新出发的成长电影' } },
];

const PAGE_TEXT = {
  'ko-KR': { desc: '당신의 오늘 감정을 읽고 딱 맞는 영화를 찾아드려요.', aiTitle: '✨ AI 분석 맞춤 추천 영화', err: '서버와 통신할 수 없습니다.', loginBtn: '로그인', watchlist: '관심 목록', watched: '본 영화', profile: '프로필', logout: '로그아웃', footer: 'AI 기반 감정 영화 큐레이터' },
  'en-US': { desc: 'Tell us your mood, and we will find the perfect movie for you.', aiTitle: '✨ AI Analysed Recommendations', err: 'Connection failed.', loginBtn: 'Sign In', watchlist: 'Watchlist', watched: 'Watched', profile: 'Profile', logout: 'Log Out', footer: 'AI-Powered Emotional Movie Curator' },
  'ja-JP': { desc: '今日の気分を教えてください。ぴったりの映画を見つけます。', aiTitle: '✨ AI分析 カスタマイズ推薦映画', err: 'サーバーと通信できません。', loginBtn: 'ログイン', watchlist: 'ウォッチリスト', watched: '視聴済み', profile: 'プロフィール', logout: 'ログアウト', footer: 'AI感情映画キュレーター' },
  'zh-CN': { desc: '告诉我们您今天的心情，我们会为您找到完美的电影。', aiTitle: '✨ AI分析 专属推荐电影', err: '无法连接到服务器。', loginBtn: '登录', watchlist: '观看清单', watched: '已观看', profile: '个人资料', logout: '退出登录', footer: 'AI 情绪电影推荐器' }
};

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState(['ALL']);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [randomThemes, setRandomThemes] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentUser, setCurrentUser] = useState(null)
  const [isNavCondensed, setIsNavCondensed] = useState(false)

  useEffect(() => {
    setLanguage(getStoredLanguage())

    const nickname = localStorage.getItem('nickname')
    const token = localStorage.getItem('token')
    if (nickname && token) {
      setCurrentUser(nickname)
    }
  }, [])

  useEffect(() => {
    saveStoredLanguage(language)
  }, [language])

  useEffect(() => {
    const handleScroll = () => {
      setIsNavCondensed(window.scrollY > 90)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchRandomThemes = async () => {
      try {
        const shuffled = [...EMOTION_THEMES].sort(() => 0.5 - Math.random()).slice(0, 5);
        // 👇 2. http://localhost:8000 대신 ${API_URL} 로 변경!
        const requests = shuffled.map(theme => 
          axios.get(`${API_URL}/api/movies?genre_id=${theme.genreId}&language=${language}`)
        );
        const responses = await Promise.all(requests);
        
        const themesWithMovies = shuffled.map((theme, index) => ({
          ...theme,
          movies: responses[index].data.movies?.slice(0, 10) || []
        }));
        setRandomThemes(themesWithMovies);
      } catch (error) {
        console.error("랜덤 테마 영화 로드 실패:", error);
      }
    };
    fetchRandomThemes();
  }, [language]);

  const handleSearch = async (rawMood) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const targetCountry = country.includes('ALL') ? '' : country.join(',');
      const response = await axios.post(`${API_URL}/api/recommend`, {
        raw_mood: rawMood, country: targetCountry, language: language
      }, { timeout: 60000 });
      if (response.data.success) {
        setMovies(response.data.movies);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('API Error:', error);
      alert(PAGE_TEXT[language].err);
    } finally {
      setLoading(false);
    }
  };

const handleDirectSearch = async (keyword, lang) => {
    if (!keyword.trim()) return
    try {
      const response = await axios.get(
        `${API_URL}/api/movies/search`,
        { params: { query: keyword, language: lang || language } }
      )
      setMovies(response.data.movies)
      setHasSearched(true)
    } catch (err) {
      console.error('Search failed:', err)
    }
  }

  const text = PAGE_TEXT[language] || PAGE_TEXT['ko-KR'];

  const sectionTitle = {
    'ko-KR': hasSearched ? '🔍 검색 결과' : '✨ AI 맞춤 추천',
    'en-US': hasSearched ? '🔍 Search Results' : '✨ AI Recommendations',
    'ja-JP': hasSearched ? '🔍 検索結果' : '✨ AI おすすめ',
    'zh-CN': hasSearched ? '🔍 搜索结果' : '✨ AI 推荐',
  }[language] || (hasSearched ? '🔍 Search Results' : '✨ AI Recommendations')

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30">
      <header className="relative w-full pt-28 pb-20 flex flex-col items-center justify-center overflow-hidden mb-6 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950 z-0" />

        <nav className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-300 ${
          isNavCondensed
            ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/30'
            : 'bg-transparent'
        }`}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center">
            <Link
              href="/"
              className={`absolute left-4 sm:left-6 text-2xl sm:text-3xl font-black tracking-tight drop-shadow-2xl transition-all duration-300 ${
                isNavCondensed
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-3 pointer-events-none'
              }`}
              aria-hidden={!isNavCondensed}
            >
              Mood<span className="text-purple-500">Flick</span>
            </Link>

            <div className={`flex items-center gap-3 transition-all duration-300 ${
              isNavCondensed ? 'ml-auto' : 'mx-auto'
            }`}>
            <SearchBar language={language} onSearch={handleDirectSearch} />
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserMenu
                  username={currentUser}
                  profileLabel={text.profile}
                  logoutLabel={text.logout}
                  onLogout={() => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('nickname')
                    setCurrentUser(null)
                  }}
                />
                <Link
                  href="/watchlist"
                  className="px-4 py-2 h-10 bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-sm text-white rounded-full transition-all shadow-lg flex items-center"
                >
                  {text.watchlist}
                </Link>
                <Link
                  href="/watched"
                  className="px-4 py-2 h-10 bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-sm text-white rounded-full transition-all shadow-lg flex items-center"
                >
                  {text.watched}
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 h-10 bg-purple-600 hover:bg-purple-500 font-bold text-sm text-white rounded-full transition-all shadow-lg active:scale-95"
              >
                {text.loginBtn}
              </button>
            )}
            <LanguageToggle language={language} setLanguage={setLanguage} />
          </div>
          </div>
        </nav>

        <div className="relative z-10 w-full max-w-3xl text-center px-6">

          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
            Mood<span className="text-purple-500">Flick</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-medium mb-8">
            {text.desc}
          </p>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-3xl shadow-2xl relative z-40">
            <MoodInput onSearch={handleSearch} loading={loading} language={language} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        <section className="mb-10">
          <CountryFilter value={country} onChange={setCountry} language={language} />
        </section>

        {movies.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-extrabold text-purple-400 mb-6 px-2 flex items-center gap-2">
              {sectionTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {movies.map((movie, index) => (
                <MovieCard key={movie.tmdbId || index} movie={movie} onClick={(m) => setSelectedMovie(m)} />
              ))}
            </div>
          </section>
        )}

        {(!hasSearched || movies.length === 0) && (
          <section className="mt-6 border-t border-slate-900 pt-10">
            {randomThemes.map((theme) => (
              <MovieRow 
                key={theme.id}
                title={theme.title[language] || theme.title['ko-KR']} 
                movies={theme.movies}
                onMovieClick={(m) => setSelectedMovie(m)} // 👈 프롭스 추가
              />
            ))}
          </section>
        )}
      </main>

      <footer className="border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
        <p>© 2026 MoodFlick. {text.footer}.</p>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        language={language} 
      />

      {/* 👇 3. 영화가 선택되었을 때만 모달 렌더링 */}
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
