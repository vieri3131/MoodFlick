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
    description: '계정 정보를 확인하고 수정할 수 있습니다.',
    nickname: '닉네임',
    email: '이메일',
    password: '비밀번호',
    currentPassword: '현재 비밀번호',
    newPassword: '새 비밀번호',
    confirmPassword: '새 비밀번호 확인',
    newNickname: '새 닉네임',
    editProfile: '프로필 수정',
    save: '저장',
    cancel: '취소',
    loading: '불러오는 중...',
    authRequired: '로그인이 필요한 페이지입니다.',
    loadError: '프로필을 불러오지 못했습니다.',
    updateError: '프로필을 수정하지 못했습니다.',
    updated: '저장되었습니다.',
    passwordMismatch: '새 비밀번호가 일치하지 않습니다.',
    noChanges: '변경할 내용을 입력해 주세요.',
    currentPasswordRequired: '현재 비밀번호를 입력해 주세요.',
    watchlist: '관심 목록',
    watched: '본 영화',
    profile: '프로필',
    logout: '로그아웃',
    hidden: '••••••••',
  },
  'en-US': {
    title: 'Profile',
    description: 'View and update your account details.',
    nickname: 'Nickname',
    email: 'Email',
    password: 'Password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    newNickname: 'New nickname',
    editProfile: 'Edit Profile',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    authRequired: 'Please sign in to view this page.',
    loadError: 'Could not load your profile.',
    updateError: 'Could not update your profile.',
    updated: 'Saved successfully.',
    passwordMismatch: 'New passwords do not match.',
    noChanges: 'Please enter something to change.',
    currentPasswordRequired: 'Current password is required.',
    watchlist: 'Watchlist',
    watched: 'Watched',
    profile: 'Profile',
    logout: 'Log Out',
    hidden: '••••••••',
  },
  'ja-JP': {
    title: 'プロフィール',
    description: 'アカウント情報を確認・編集できます。',
    nickname: 'ニックネーム',
    email: 'メールアドレス',
    password: 'パスワード',
    currentPassword: '現在のパスワード',
    newPassword: '新しいパスワード',
    confirmPassword: '新しいパスワード（確認）',
    newNickname: '新しいニックネーム',
    editProfile: 'プロフィールを編集',
    save: '保存',
    cancel: 'キャンセル',
    loading: '読み込み中...',
    authRequired: 'このページを見るにはログインが必要です。',
    loadError: 'プロフィールを読み込めませんでした。',
    updateError: 'プロフィールを更新できませんでした。',
    updated: '保存しました。',
    passwordMismatch: '新しいパスワードが一致しません。',
    noChanges: '変更内容を入力してください。',
    currentPasswordRequired: '現在のパスワードを入力してください。',
    watchlist: 'ウォッチリスト',
    watched: '視聴済み',
    profile: 'プロフィール',
    logout: 'ログアウト',
    hidden: '••••••••',
  },
  'zh-CN': {
    title: '个人资料',
    description: '查看并更新您的账户信息。',
    nickname: '昵称',
    email: '电子邮箱',
    password: '密码',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmPassword: '确认新密码',
    newNickname: '新昵称',
    editProfile: '编辑资料',
    save: '保存',
    cancel: '取消',
    loading: '加载中...',
    authRequired: '请先登录后查看此页面。',
    loadError: '无法加载个人资料。',
    updateError: '无法更新个人资料。',
    updated: '已保存。',
    passwordMismatch: '两次输入的新密码不一致。',
    noChanges: '请输入要更改的内容。',
    currentPasswordRequired: '请输入当前密码。',
    watchlist: '观看清单',
    watched: '已观看',
    profile: '个人资料',
    logout: '退出登录',
    hidden: '••••••••',
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [profile, setProfile] = useState({ nickname: '', email: '', hasPassword: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const resetForm = () => {
    setCurrentPassword('');
    setNewNickname('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword.trim()) {
      setError(text.currentPasswordRequired);
      return;
    }

    const hasNicknameChange = newNickname.trim().length > 0;
    const hasPasswordChange = newPassword.length > 0;

    if (!hasNicknameChange && !hasPasswordChange) {
      setError(text.noChanges);
      return;
    }

    if (hasPasswordChange && newPassword !== confirmPassword) {
      setError(text.passwordMismatch);
      return;
    }

    const payload = { current_password: currentPassword };
    if (hasNicknameChange) payload.nickname = newNickname.trim();
    if (hasPasswordChange) payload.password = newPassword;

    try {
      const response = await axios.patch(
        `${API_URL}/auth/profile`,
        payload,
        { headers: getAuthHeaders() }
      );
      setProfile(response.data);
      if (response.data.nickname) {
        localStorage.setItem('nickname', response.data.nickname);
      }
      setSuccess(text.updated);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || text.updateError);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-[80] bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/30">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center">
          <Link href="/" className="absolute left-4 sm:left-6 text-2xl sm:text-3xl font-black tracking-tight">
            Mood<span className="text-purple-500">Flick</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
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

      <main className="max-w-xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black">{text.title}</h1>
          <p className="mt-2 text-slate-400 text-sm">{text.description}</p>
        </div>

        {loading && <p className="text-slate-400">{text.loading}</p>}

        {!loading && (
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl overflow-hidden">

            <div className="divide-y divide-white/5">
              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{text.nickname}</p>
                  <p className="text-white font-bold text-lg">{profile.nickname || '—'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{text.email}</p>
                  <p className="text-white font-bold text-lg">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{text.password}</p>
                  <p className="text-white font-bold text-lg tracking-widest">{text.hidden}</p>
                </div>
              </div>
            </div>

            {!isEditing && (
              <div className="px-6 py-5 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all active:scale-[0.99]"
                >
                  {text.editProfile}
                </button>
              </div>
            )}

            {isEditing && (
              <div className="px-6 py-6 border-t border-white/5 space-y-4">

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{text.newNickname}</label>
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    placeholder={profile.nickname}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-slate-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{text.newPassword}</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-slate-600 text-sm"
                  />
                </div>

                {newPassword.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{text.confirmPassword}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 bg-slate-950/60 border rounded-xl text-white outline-none focus:ring-1 transition-all placeholder:text-slate-600 text-sm ${
                        confirmPassword.length > 0 && newPassword !== confirmPassword
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                          : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/30'
                      }`}
                    />
                    {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">{text.passwordMismatch}</p>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-white/5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{text.currentPassword}</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-slate-600 text-sm"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                {success && <p className="text-green-400 text-sm">{success}</p>}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all active:scale-[0.99]"
                  >
                    {text.save}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all active:scale-[0.99]"
                  >
                    {text.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
