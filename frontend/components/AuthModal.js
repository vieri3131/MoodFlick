import { useState, useEffect } from 'react';

export default function AuthModal({ isOpen, onClose, language }) {
  // 'login' 또는 'signup' 상태 관리
const [activeTab, setActiveTab] = useState('login');

  // 입력 필드 상태 관리
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [nickname, setNickname] = useState('');

  // 다국어 텍스트 매핑
// 다국어 텍스트 매핑
const UI_TEXT = {
    'ko-KR': {
    login: '로그인', signup: '회원가입', email: '이메일 또는 아이디', password: '비밀번호',
    confirmPw: '비밀번호 확인', name: '닉네임', btnLogin: '시작하기', btnSignup: '동의하고 가입하기',
    msg: '아직 계정이 없으신가요?', msgGoSignup: '지금 가입하세요', msgGoLogin: '이미 계정이 있으신가요?'
    },
    'en-US': {
    login: 'Sign In', signup: 'Sign Up', email: 'Email or ID', password: 'Password',
    confirmPw: 'Confirm Password', name: 'Nickname', btnLogin: 'Sign In', btnSignup: 'Get Started',
    msg: 'New to MoodFlick?', msgGoSignup: 'Sign up now', msgGoLogin: 'Already have an account?'
    },
    'ja-JP': {
    login: 'ログイン', signup: '新規登録', email: 'メールアドレスまたはID', password: 'パスワード',
    confirmPw: 'パスワード再確認', name: 'ニックネーム', btnLogin: 'ログイン', btnSignup: '登録する',
    msg: 'アカウントをお持ちでないですか？', msgGoSignup: '今すぐ登録', msgGoLogin: 'すでにアカウントをお持ちですか？'
    },
    'zh-CN': {
    login: '登录', signup: '注册', email: '电子邮箱 or 账号', password: '密码',
    confirmPw: '确认密码', name: '昵称', btnLogin: '登录', btnSignup: '立即注册',
    msg: '还没有账号吗？', msgGoSignup: '现在注册', msgGoLogin: '已经有账号了？'
    }
};

const text = UI_TEXT[language] || UI_TEXT['ko-KR'];

  // 모달이 닫히면 입력값 초기화
useEffect(() => {
    if (!isOpen) {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNickname('');
    }
}, [isOpen]);

if (!isOpen) return null;

const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'login') {
    alert(`${email}님, 로그인이 시뮬레이션 되었습니다. (곧 DB 연동 예정!)`);
    } else {
    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    alert(`${nickname}님, 회원가입이 시뮬레이션 되었습니다.`);
    }
    onClose();
};

return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      {/* 닫기 배경 클릭 영역 */}
    <div className="absolute inset-0" onClick={onClose} />

      {/* 132.jpg 스타일의 메인 모달 카드 카드 */}
    <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 overflow-hidden">
        
        {/* 상단 장식 네온 그라데이션 라인 */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />

        {/* 우측 상단 닫기 X 버튼 */}
        <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        </button>

        {/* 탭 헤더 (로그인 / 회원가입) */}
        <div className="flex gap-6 mb-8 border-b border-white/5 pb-2">
        <button 
            onClick={() => setActiveTab('login')}
            className={`text-2xl font-black pb-2 transition-all relative ${activeTab === 'login' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
            {text.login}
            {activeTab === 'login' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500 rounded-full" />}
        </button>
        <button 
            onClick={() => setActiveTab('signup')}
            className={`text-2xl font-black pb-2 transition-all relative ${activeTab === 'signup' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
            {text.signup}
            {activeTab === 'signup' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500 rounded-full" />}
        </button>
        </div>

        {/* 폼 섹션 */}
        <form onSubmit={handleSubmit} className="space-y-5">
        {activeTab === 'signup' && (
            <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{text.name}</label>
            <input 
                type="text" required value={nickname} onChange={(e) => setNickname(e.target.value)}
                placeholder="MoodUser"
                className="w-full px-5 py-3.5 bg-slate-950/60 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-slate-600 text-sm"
            />
            </div>
        )}

        <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{text.email}</label>
            <input 
            type="text" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="example@moodflick.com"
            className="w-full px-5 py-3.5 bg-slate-950/60 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-slate-600 text-sm"
            />
        </div>

        <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{text.password}</label>
            <input 
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-5 py-3.5 bg-slate-950/60 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-slate-600 text-sm"
            />
        </div>

        {activeTab === 'signup' && (
            <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{text.confirmPw}</label>
            <input 
                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-slate-950/60 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-slate-600 text-sm"
            />
            </div>
        )}

          {/* 제출 버튼 (그라데이션 효과) */}
        <button 
            type="submit"
            className="w-full py-4 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-[0.99]"
        >
            {activeTab === 'login' ? text.btnLogin : text.btnSignup}
        </button>
        </form>

        {/* 하단 안내 가이드 멘트 */}
        <div className="mt-8 text-center text-sm text-slate-400">
        {activeTab === 'login' ? (
            <p>
            {text.msg}{' '}
            <button onClick={() => setActiveTab('signup')} className="text-purple-400 font-semibold hover:underline">
                {text.msgGoSignup}
            </button>
            </p>
        ) : (
            <p>
            {text.msgGoLogin}{' '}
            <button onClick={() => setActiveTab('login')} className="text-purple-400 font-semibold hover:underline">
                {text.login}
            </button>
            </p>
        )}
        </div>
    </div>
    </div>
);
}