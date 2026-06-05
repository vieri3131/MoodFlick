export default function MovieCard({ movie, onClick }) {
  const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%231e293b'/%3E%3Ctext x='150' y='210' text-anchor='middle' fill='%2364748b' font-size='48'%3E🎬%3C/text%3E%3Ctext x='150' y='260' text-anchor='middle' fill='%2364748b' font-size='14'%3ENo Poster%3C/text%3E%3C/svg%3E";

  return (
    <div
      onClick={() => onClick && onClick(movie)}
      className="group relative bg-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)] cursor-pointer"
    >
      <div className="relative aspect-[2/3] w-full">
        <img
          src={movie.posterUrl || FALLBACK}
          alt={movie.title}
          onError={(e) => { e.target.src = FALLBACK; }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80" />
      </div>

      <div className="absolute bottom-0 w-full p-5 flex flex-col justify-end">
        <h3 className="text-white font-bold text-xl mb-1 truncate drop-shadow-md">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          {movie.rating != null && (
            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              ★ {movie.rating.toFixed(1)}
            </span>
          )}
        </div>

        {movie.recommendReason && (
          <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300">
            <p className="text-sm text-gray-300 leading-snug line-clamp-3">
              "{movie.recommendReason}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
