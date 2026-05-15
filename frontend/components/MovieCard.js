export default function MovieCard({ movie }) {
return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300">
    <div className="relative h-80 w-full">
        <img
        src={movie.posterUrl || '/placeholder-poster.png'}
        alt={movie.title}
        className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/60 text-yellow-400 px-2 py-1 rounded-md text-sm font-bold">
        ★ {movie.rating?.toFixed(1)}
        </div>
    </div>
    <div className="p-5">
        <h3 className="text-xl font-bold mb-2 truncate">{movie.title}</h3>
        <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
        <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-bold text-purple-600">AI 추천 이유: </span>
            {movie.recommendReason}
        </p>
        </div>
    </div>
    </div>
);
}