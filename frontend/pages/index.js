import { useState, useEffect } from 'react';
import axios from 'axios';
import MoodInput from '../components/MoodInput';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import CountryFilter from '../components/CountryFilter';
import LanguageToggle from '../components/LanguageToggle';

// 🎭 10가지 감정 테마와 TMDB 장르 ID 매핑 데이터
const EMOTION_THEMES = [
{ id: 'happy', genreId: 35, title: { ko: '😊 기분 좋은 하루! 유쾌한 코미디', en: '😊 Feel Good Comedies' } },
{ id: 'sad', genreId: 18, title: { ko: '😢 마음을 툭 건드리는 감성 드라마', en: '😢 Emotional & Touching Dramas' } },
{ id: 'angry', genreId: 28, title: { ko: '🔥 스트레스 타파! 화끈한 액션', en: '🔥 Stress Buster Action' } },
{ id: 'romantic', genreId: 10749, title: { ko: '💕 설렘 가득, 달콤한 로맨스', en: '💕 Romantic & Sweet' } },
{ id: 'scary', genreId: 27, title: { ko: '👻 오싹한 긴장감, 공포/스릴러', en: '👻 Chilling Horror' } },
{ id: 'excited', genreId: 12, title: { ko: '🤩 심장 쫄깃! 흥미진진 어드벤처', en: '🤩 Exciting Adventures' } },
{ id: 'calm', genreId: 10751, title: { ko: '☕ 차분하게 즐기는 힐링 가족 영화', en: '☕ Calming Family Movies' } },
{ id: 'lonely', genreId: 10402, title: { ko: '🌙 외로움을 달래주는 음악/뮤지컬', en: '🌙 Comforting Music Movies' } },
{ id: 'tired', genreId: 16, title: { ko: '🥱 지친 하루의 끝, 힐링 애니메이션', en: '🥱 Relaxing Animations' } },
{ id: 'bored', genreId: 878, title: { ko: '🍿 심심할 땐 꿀잼 상상력, SF 판타지', en: '🍿 Fun Sci-Fi & Fantasy' } },
];

export default function Home() {
  // 검색 결과 상태 관리
const [movies, setMovies] = useState([]);
const [loading, setLoading] = useState(false);
const [country, setCountry] = useState('KR');
const [language, setLanguage] = useState('ko-KR');

  // 🎲 랜덤 감정 테마 결과 상태 관리 (5개)
const [randomThemes, setRandomThemes] = useState([]);

useEffect(() => {
    const fetchRandomThemes = async () => {
    try {
        // 1. 10개의 테마 중 랜덤으로 순서를 섞고(shuffle) 상위 5개만 추출
        const shuffled = [...EMOTION_THEMES].sort(() => 0.5 - Math.random()).slice(0, 5);

        // 2. 추출된 5개 테마에 대해 백엔드 API 동시 호출 (초고속 병렬 처리)
        const requests = shuffled.map(theme => 
        axios.get(`http://localhost:8000/api/movies?genre_id=${theme.genreId}&language=${language}`)
        );
        const responses = await Promise.all(requests);

        // 3. 응답받은 영화 데이터를 각각의 테마 객체에 결합하여 상태에 저장
        const themesWithMovies = shuffled.map((theme, index) => ({
        ...theme,
          movies: responses[index].data.movies?.slice(0, 10) || [] // 가로 스크롤엔 10개씩만 표시
        }));

        setRandomThemes(themesWithMovies);
    } catch (error) {
        console.error("랜덤 테마 영화 로드 실패:", error);
    }
    };

    fetchRandomThemes();
  }, [language]); // 언어가 바뀔 때마다 테마 텍스트도 업데이트

  // AI 감정 분석 검색 함수
const handleSearch = async (rawMood) => {
    setLoading(true);
    try {
    const response = await axios.post('http://localhost:8000/api/recommend', {
        raw_mood: rawMood,
        country: country,
        language: language
    });

    if (response.data.success) {
        setMovies(response.data.movies);
    } else {
        alert(response.data.message);
    }
    } catch (error) {
    console.error('API Error:', error);
    alert(language === 'ko-KR' ? '서버와 통신할 수 없습니다.' : 'Failed to connect to the server.');
    } finally {
    setLoading(false);
    }
};

return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30">
    
    <header className="relative w-full py-20 flex flex-col items-center justify-center overflow-hidden mb-6 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950 z-0" />
        <div className="relative z-10 w-full max-w-3xl text-center px-6">
        <div className="absolute -top-12 right-0">
            <LanguageToggle language={language} setLanguage={setLanguage} />
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
            Mood<span className="text-purple-500">Flick</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-medium mb-8">
            {language === 'ko-KR' 
            ? '당신의 오늘 감정을 읽고 딱 맞는 영화를 찾아드려요.' 
            : 'Tell us your mood, and we will find the perfect movie for you.'}
        </p>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-3xl shadow-2xl">
            <MoodInput onSearch={handleSearch} loading={loading} language={language} />
        </div>
        </div>
    </header>

    <main className="max-w-7xl mx-auto px-6 pb-24">
        <section className="mb-10">
        <CountryFilter value={country} onChange={setCountry} language={language} />
        </section>

        {/* 1. 유저 맞춤 검색 결과 (검색했을 때만 노출) */}
        {movies.length > 0 && (
        <section className="mb-16">
            <h2 className="text-2xl font-extrabold text-purple-400 mb-6 px-2 flex items-center gap-2">
            ✨ {language === 'ko-KR' ? 'AI 분석 맞춤 추천 영화' : 'AI Analysed Recommendations'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {movies.map((movie, index) => (
                <MovieCard key={movie.tmdbId || index} movie={movie} />
            ))}
            </div>
        </section>
        )}

        {/* 2. 감정별 랜덤 테마 가로 스크롤 추천 (항상 노출, 새로고침 시 변경) */}
        <section className="mt-6 border-t border-slate-900 pt-10">
        {randomThemes.map((theme, index) => (
            <MovieRow 
            key={theme.id}
            title={language === 'ko-KR' ? theme.title.ko : theme.title.en} 
            movies={theme.movies} 
            />
        ))}
        </section>
    </main>

    <footer className="border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
        <p>© 2026 MoodFlick. AI-Powered Emotional Movie Curator.</p>
    </footer>
    </div>
);
}