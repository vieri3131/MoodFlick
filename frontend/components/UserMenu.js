import { useEffect, useRef, useState } from 'react';

export default function UserMenu({ username, logoutLabel, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="px-4 py-2 h-10 bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-sm text-white rounded-full transition-all shadow-lg flex items-center gap-2 active:scale-95"
        aria-expanded={isOpen}
      >
        <span>👤</span>
        <span>{username}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="w-full text-left px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            {logoutLabel}
          </button>
        </div>
      )}
    </div>
  );
}
