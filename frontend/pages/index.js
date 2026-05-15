import { useState } from 'react';
import axios from 'axios';
import MoodInput from '../components/MoodInput';
import MovieCard from '../components/MovieCard';
import CountryFilter from '../components/CountryFilter';
import LanguageToggle from '../components/LanguageToggle';

export default function Home() {
const [movies, setMovies] = useState([]);
const [loading, setLoading] = useState(false);

  // 백엔드 RecommendRequest 스키마에 맞춘 상태 관리
const [country, setCountry] = useState('KR');
const [language, setLanguage] = useState('ko-KR');

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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
    <main className="max-w-6xl mx-auto">
        <LanguageToggle language={language} setLanguage={setLanguage} />
        
        <header className="text-center mb-10 mt-4">
        <h1 className="text-5xl font-extrabold text-purple-900 mb-4">MoodFlick</h1>
        <p className="text-gray-600">
            {language === 'ko-KR' 
            ? '당신의 오늘 감정을 읽고 딱 맞는 영화를 찾아드려요.' 
            : 'Tell us your mood, and we will find the perfect movie for you.'}
        </p>
        </header>

        <CountryFilter value={country} onChange={setCountry} language={language} />
        
        <MoodInput onSearch={handleSearch} loading={loading} language={language} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {movies.map((movie, index) => (
            <MovieCard key={movie.tmdbId || index} movie={movie} />
        ))}
        </div>
    </main>
    </div>
);
}