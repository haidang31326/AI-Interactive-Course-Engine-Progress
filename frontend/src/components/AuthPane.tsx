import React, { useState } from 'react';
import type { User } from '../types';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';

interface AuthPaneProps {
  onLoginSuccess: (user: User) => void;
  onBack?: () => void;
}

export const AuthPane: React.FC<AuthPaneProps> = ({ onLoginSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const syncWithBackend = async (firebaseUid: string, userEmail: string | null, displayName: string | null) => {
    try {
      // 1. Lấy Firebase ID Token và lưu vào localStorage để các request axios tự động gắn Bearer Token
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true);
        localStorage.setItem('token', token);
      }

      // 2. Đồng bộ user sang Backend Spring Boot
      const user = await authApi.firebaseLogin({
        firebaseUid,
        email: userEmail || '',
        username: displayName || (userEmail ? userEmail.split('@')[0] : `User_${firebaseUid.slice(0, 5)}`),
      });

      onLoginSuccess(user);
    } catch (err: any) {
      console.error('[AuthPane] Sync with backend error:', err);
      if (err.response?.status === 500) {
        setError('Hệ thống máy chủ đang bảo trì hoặc quá tải. Vui lòng thử lại sau.');
      } else {
        setError(err.response?.data?.message || 'Đăng nhập thành công nhưng không thể đồng bộ hồ sơ máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      await syncWithBackend(
        userCredential.user.uid,
        userCredential.user.email,
        !isLogin && username ? username : userCredential.user.displayName
      );
    } catch (err: any) {
      console.error('[AuthPane] Firebase error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Email hoặc mật khẩu không chính xác.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được sử dụng. Vui lòng chuyển sang đăng nhập.');
      } else if (err.code === 'auth/weak-password') {
        setError('Mật khẩu cần ít nhất 6 ký tự.');
      } else {
        setError('Xác thực thất bại: ' + (err.message || 'Lỗi không xác định'));
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncWithBackend(result.user.uid, result.user.email, result.user.displayName);
    } catch (err: any) {
      console.error('[AuthPane] Google login error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Đăng nhập Google bị gián đoạn hoặc thất bại.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090D16] font-sans relative px-4 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium py-2 px-3 rounded-lg hover:bg-slate-900/60"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang chủ
        </button>
      )}

      <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Interactive Course Engine</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-slate-400 text-sm">
            Học tập tương tác và làm chủ kiến thức cùng trợ lý AI cá nhân
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3.5 rounded-xl mb-6 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Tiếp tục với Google</span>
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-slate-800"></div>
          <span className="px-4 text-slate-500 text-xs uppercase tracking-wider font-medium">hoặc email</span>
          <div className="flex-1 border-t border-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                placeholder="VD: Alex Nguyen"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Địa chỉ Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              placeholder="tenban@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Nhập lại mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                placeholder="••••••••"
                required={!isLogin}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : isLogin ? (
              'Đăng nhập'
            ) : (
              'Đăng ký tài khoản'
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-slate-400 hover:text-indigo-400 font-medium transition-colors text-sm"
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
