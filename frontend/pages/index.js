import { useState } from 'react';
import axios from 'axios';
import MoodInput from '../components/MoodInput';
import MovieCard from '../components/MovieCard';
import CountryFilter from '../components/CountryFilter';
import LanguageToggle from '../components/LanguageToggle';

export default function Home() {
  // FE-05: API 통신 결과 및 로딩 상태 관리 [cite: 24]
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);

  // FE-01, FE-03: 국가 및 언어 설정 상태 관리 [cite: 17, 29]
    const [country, setCountry] = useState('KR');
    const [language, setLanguage] = useState('ko-KR');

  // FE-05: 백엔드 API 연동 함수 [cite: 22, 26]
    const handleSearch = async (rawMood) => {
        setLoading(true);
        try {
      // 백엔드 RecommendRequest 스키마 규격 준수 [cite: 15]
            const response = await axios.post('http://localhost:8000/api/recommend', {
                raw_mood: rawMood,
                country: country,
                language: language
            });
    
            if (response.data.success) {
                setMovies(response.data.movies);
            } 
            else {
                alert(response.data.message);
            }
        } 
        catch (error) {
            console.error('API Error:', error);
            const errorMsg = language === 'ko-KR' 
            ? '서버와 통신할 수 없습니다. 백엔드 서버 상태를 확인해주세요.' 
            : 'Failed to connect to the server. Please check the backend status.';
            alert(errorMsg);
        }
        finally {
            setLoading(false);
        }
    };
    
    return (
        // 전체 배경: 넷플릭스보다 부드러운 다크 네이비 톤 적용
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30">

        {/* 히어로 섹션: 티빙 스타일의 부드러운 그라데이션과 글래스모피즘  */}
        <header className="relative w-full py-20 flex flex-col items-center justify-center overflow-hidden mb-10 shadow-2xl">
            {/* 배경 레이어: 보라색 포인트 그라데이션 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950 to-slate-950 z-0" />
        
            <div className="relative z-10 w-full max-w-3xl text-center px-6">
            {/* FE-01: 언어 전환 토글 [cite: 29] */}
            <div className="absolute -top-12 right-0">
                <LanguageToggle language={language} setLanguage={setLanguage} />
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
                Mood<span className="text-purple-500">Flick</span>
            </h1>
        
            <p className="text-lg md:text-xl text-slate-400 font-medium mb-10">
                {language === 'ko-KR' 
                ? '당신의 오늘 감정을 읽고 딱 맞는 영화를 찾아드려요.' 
                : 'Tell us your mood, and we will find the perfect movie for you.'}
            </p>

            {/* FE-02: 글래스모피즘이 적용된 감정 입력 컨테이너 [cite: 14, 29] */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-3xl shadow-2xl">
                <MoodInput onSearch={handleSearch} loading={loading} language={language} />
            </div>
            </div>
        </header>

    <main className="max-w-7xl mx-auto px-6 pb-24">
        {/* FE-03: 국가 필터 섹션 [cite: 17, 29] */}
        <section className="mb-12">
        <div className="flex items-center justify-center mb-6">
            <div className="h-px bg-slate-800 flex-grow max-w-[100px]"></div>
            <span className="px-4 text-slate-500 text-sm font-bold tracking-widest uppercase">
            {language === 'ko-KR' ? '국가 선택' : 'Select Country'}
            </span>
            <div className="h-px bg-slate-800 flex-grow max-w-[100px]"></div>
        </div>
        <CountryFilter value={country} onChange={setCountry} language={language} />
        </section>

        {/* FE-04: 추천 결과 그리드 [cite: 10, 30] */}
        {movies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {movies.map((movie, index) => (
            <MovieCard key={movie.tmdbId || index} movie={movie} />
            ))}
        </div>
        )}

        {/* 결과가 없을 때의 안내 UI */}
        {!loading && movies.length === 0 && (
        <div className="text-center py-20">
            <p className="text-slate-500 text-lg">
            {language === 'ko-KR' 
                ? '오늘의 감정을 입력하여 영화 추천을 시작해보세요.' 
                : 'Enter your mood to start getting movie recommendations.'}
            </p>
        </div>
        )}
    </main>

    {/* 푸터 영역 */}
    <footer className="border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
        <p>© 2026 MoodFlick. AI-Powered Emotional Movie Curator.</p>
    </footer>
    </div>
    );
}