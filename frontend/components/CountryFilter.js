export default function CountryFilter({ value, onChange, language }) {
  const countries = [
    { code: 'ALL', labels: { 'ko-KR': '🌐 전체', 'en-US': '🌐 All', 'ja-JP': '🌐 すべて', 'zh-CN': '🌐 全部' } },
    { code: 'KR', labels: { 'ko-KR': '🇰🇷 한국', 'en-US': '🇰🇷 Korea', 'ja-JP': '🇰🇷 韓国', 'zh-CN': '🇰🇷 韩国' } },
    { code: 'US', labels: { 'ko-KR': '🇺🇸 미국', 'en-US': '🇺🇸 USA', 'ja-JP': '🇺🇸 アメリカ', 'zh-CN': '🇺🇸 美国' } },
    { code: 'JP', labels: { 'ko-KR': '🇯🇵 일본', 'en-US': '🇯🇵 Japan', 'ja-JP': '🇯🇵 日本', 'zh-CN': '🇯🇵 日本' } },
    { code: 'CN', labels: { 'ko-KR': '🇨🇳 중국', 'en-US': '🇨🇳 China', 'ja-JP': '🇨🇳 中国', 'zh-CN': '🇨🇳 中国' } }
  ];

  // 중복 선택 토글 핸들러
  const handleToggle = (code) => {
    if (code === 'ALL') {
      onChange(['ALL']); // '전체'를 누르면 ALL만 남기고 초기화
      return;
    }

    // 기존 선택 목록에서 ALL 제외
    let nextValue = value.filter(c => c !== 'ALL');

    if (nextValue.includes(code)) {
      // 이미 선택되어 있으면 제거
      nextValue = nextValue.filter(c => c !== code);
    } else {
      // 선택되어 있지 않으면 추가
      nextValue = [...nextValue, code];
    }

    // 아무것도 선택하지 않은 상태가 되면 다시 '전체'로 기본 설정
    if (nextValue.length === 0) {
      nextValue = ['ALL'];
    }

    onChange(nextValue);
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
      {countries.map((country) => {
        const label = country.labels[language] || country.labels['ko-KR'];
        // value 배열 안에 현재 국가 코드가 포함되어 있는지 확인하여 활성화
        const isActive = value.includes(country.code);

        return (
          <button
            key={country.code}
            type="button"
            onClick={() => handleToggle(country.code)}
            className={`px-5 py-2.5 text-sm font-bold rounded-full border transition-all duration-300 active:scale-95 ${
              isActive
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-lg shadow-purple-500/20'
                : 'bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/20 hover:text-white backdrop-blur-md'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
