import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import LanguageToggle from '../components/LanguageToggle';
import UserMenu from '../components/UserMenu';
import { API_URL, getAuthHeaders, getAuthToken } from '../lib/api';
import { DEFAULT_LANGUAGE, getStoredLanguage, saveStoredLanguage } from '../lib/language';

const TEXT = {
  'ko-KR': {
    title: '프로필',
    description: '계정 정보를 확인하고 필요한 항목만 수정할 수 있습니다.',
    nickname: '닉네임',
    email: '이메일',
    password: '비밀번호',
    hiddenPassword: '••••••••',
    edit: '수정',
    save: '저장',
    cancel: '취소',
    loading: '불러오는 중...',
    authRequired: '로그인이 필요한 페이지입니다.',
    loadError: '프로필을 불러오지 못했습니다.',
    updateError: '프로필을 수정하지 못했습니다.',
    updated: '저장되었습니다.',
    watchlist: '관심 목록',
    watched: '본 영화',
    profile: '프로필',
    logout: '로그아웃',
  },
  'en-US': {
    title: 'Profile',
    description: 'Review your account details and edit only what you need.',
    nickname: 'Nickname',
    email: 'Email',
    password: 'Password',
    hiddenPassword: '••••••••',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    authRequired: 'Please sign in to view this page.',
    loadError: 'Could not load your profile.',
    updateError: 'Could not update your profile.',
    updated: 'Saved.',
    watchlist: 'Watchlist',
    watched: 'Watched',
    profile: 'Profile',
    logout: 'Log Out',
  },
  'ja-JP': {
    title: 'プロフィール',
    description: 'アカウント情報を確認し、必要な項目だけ編集できます。',
    nickname: 'ニックネーム',
    email: 'メールアドレス',
    password: 'パスワード',
    hiddenPassword: '••••••••',
    edit: '編集',
    save: '保存',
    cancel: 'キャンセル',
    loading: '読み込み中...',
    authRequired: 'このページを見るにはログインが必要です。',
    loadError: 'プロフィールを読み込めませんでした。',
    updateError: 'プロフィールを更新できませんでした。',
    updated: '保存しました。',
    watchlist: 'ウォッチリスト',
    watched: '視聴済み',
    profile: 'プロフィール',
    logout: 'ログアウト',
  },
  'zh-CN': {
    title: '个人资料',
    description: '查看账户信息，并只编辑需要更改的项目。',
    nickname: '昵称',
    email: '电子邮箱',
    password: '密码',
    hiddenPassword: '••••••••',
    edit: '编辑',
    save: '保存',
    cancel: '取消',
    loading: '加载中...',
    authRequired: '请先登录后查看此页面。',
    loadError: '无法加载个人资料。',
    updateError: '无法更新个人资料。',
    updated: '已保存。',
    watchlist: '观看清单',
    watched: '已观看',
    profile: '个人资料',
    logout: '退出登录',
  },
};

function ProfileField({ label, value, type = 'text', text, onSave, editable = true }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const startEdit = () => {
    setDraft(type === 'password' ? '' : value || '');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft('');
    setCurrentPassword('');
    setIsEditing(false);
  };

  const saveEdit = async () => {
    const saved = await onSave(draft, currentPassword);
    if (saved) {
      setIsEditing(false);
      setDraft('');
      setCurrentPassword('');
    }
  };

  return (
    <div className="border border-white/10 bg-slate-900/70 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder={text.currentPassword || 'Current password'}
              className="w-full px-4 py-3 bg-slate-950/70 border border-white/10 rounded-lg text-white outline-none focus:border-purple-500"
              autoFocus
            />
            <input
              type={type === 'password' ? 'password' : type}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={type === 'password' ? text.newPassword || 'New password' : label}
              className="w-full px-4 py-3 bg-slate-950/70 border border-white/10 rounded-lg text-white outline-none focus:border-purple-500"
            />
          </div>
        ) : (
          <p className="text-lg font-bold text-white truncate">
            {type === 'password' ? text.hiddenPassword : value}
          </p>
        )}
      </div>

      {editable && isEditing ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveEdit}
            className="px-4 py-2 h-10 bg-purple-600 hover:bg-purple-500 font-bold text-sm text-white rounded-full transition-all shadow-lg active:scale-95"
          >
            {text.save}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="px-4 py-2 h-10 bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-sm text-white rounded-full transition-all shadow-lg active:scale-95"
          >
            {text.cancel}
          </button>
        </div>
      ) : editable ? (
        <button
          type="button"
          onClick={startEdit}
          className="px-4 py-2 h-10 bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-sm text-white rounded-full transition-all shadow-lg active:scale-95"
        >
          {text.edit}
        </button>
      ) : null}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [profile, setProfile] = useState({ nickname: '', email: '', hasPassword: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const text = TEXT[language] || TEXT['ko-KR'];

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  useEffect(() => {
    saveStoredLanguage(language);
  }, [language]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!getAuthToken()) {
        setError(text.authRequired);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: getAuthHeaders(),
        });
        setProfile(response.data);
        if (response.data.nickname) {
          localStorage.setItem('nickname', response.data.nickname);
        }
      } catch (err) {
        setError(err.response?.data?.detail || text.loadError);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [text.authRequired, text.loadError]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    router.push('/');
  };

  const updateProfile = async (field, value, currentPassword) => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.patch(
        `${API_URL}/auth/profile`,
        { [field]: value, current_password: currentPassword },
        { headers: getAuthHeaders() }
      );
      setProfile(response.data);
      if (response.data.nickname) {
        localStorage.setItem('nickname', response.data.nickname);
      }
      setSuccess(text.updated);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || text.updateError);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-[80] bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/30 transition-all duration-300">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center">
          <Link
            href="/"
            className="absolute left-4 sm:left-6 text-2xl sm:text-3xl font-black tracking-tight drop-shadow-2xl transition-all duration-300"
          >
            Mood<span className="text-purple-500">Flick</span>
          </Link>

          <div className="ml-auto flex items-center gap-3 transition-all duration-300">
            {profile.nickname && (
              <UserMenu
                username={profile.nickname}
                profileLabel={text.profile}
                logoutLabel={text.logout}
                onLogout={handleLogout}
              />
            )}
            <Link href="/watchlist" className="px-4 py-2 h-10 bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-sm text-white rounded-full transition-all shadow-lg flex items-center">
              {text.watchlist}
            </Link>
            <Link href="/watched" className="px-4 py-2 h-10 bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-sm text-white rounded-full transition-all shadow-lg flex items-center">
              {text.watched}
            </Link>
            <LanguageToggle language={language} setLanguage={setLanguage} />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black">{text.title}</h1>
          <p className="mt-2 text-slate-400">{text.description}</p>
        </div>

        {loading && <p className="text-slate-400">{text.loading}</p>}
        {!loading && error && <p className="mb-5 text-red-300">{error}</p>}
        {!loading && success && <p className="mb-5 text-green-300">{success}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            <ProfileField
              label={text.nickname}
              value={profile.nickname}
              text={text}
              onSave={(value, currentPassword) => updateProfile('nickname', value, currentPassword)}
            />
            <ProfileField
              label={text.email}
              value={profile.email}
              type="email"
              text={text}
              editable={false}
            />
            <ProfileField
              label={text.password}
              value=""
              type="password"
              text={text}
              onSave={(value, currentPassword) => updateProfile('password', value, currentPassword)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
