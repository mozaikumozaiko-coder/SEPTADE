import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAuthErrorMessage } from '../../utils/authErrors';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      setError('メールアドレスを入力してください');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('有効なメールアドレスを入力してください');
      return false;
    }

    if (!password) {
      setError('パスワードを入力してください');
      return false;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(getAuthErrorMessage(error));
      } else {
        navigate('/app');
      }
    } catch (err) {
      setError('ログイン中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-4 py-8 sm:py-12">
      <div className="scroll-panel max-w-md w-full relative p-6 sm:p-6 md:p-8 lg:p-10">
        <div className="relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-6 relative" style={{
              filter: 'drop-shadow(0 0 30px rgba(166, 124, 82, 0.5))',
              border: '3px solid rgba(166, 124, 82, 0.6)',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(166, 124, 82, 0.4), inset 0 0 20px rgba(166, 124, 82, 0.1)',
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.3)'
            }}>
              <img
                src="/a_mystical_and_adorable_shrine_mascot_character_de-1767804824217.png"
                alt="神社のマスコット"
                className="w-full h-full object-contain"
                style={{ borderRadius: '50%' }}
              />
            </div>

            <h2 className="text-3xl sm:text-3xl font-bold mb-3 glow-text" style={{ color: 'var(--pale-gold)' }}>
              ログイン
            </h2>

            <p className="text-sm sm:text-sm opacity-75" style={{ color: 'var(--dim-light)' }}>
              魂の扉を開くため、汝の証を示されよ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-5">
            {error && (
              <div className="p-3 rounded-lg text-sm" style={{
                background: 'rgba(122, 29, 46, 0.2)',
                border: '1px solid var(--torii-red)',
                color: 'var(--torii-red)'
              }}>
                {error}
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 mb-2 text-base font-medium" style={{ color: 'var(--pale-light)' }}>
                <Mail size={18} style={{ color: 'var(--ochre)' }} />
                <span>メールアドレス</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ancient-input"
                placeholder="example@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-base font-medium" style={{ color: 'var(--pale-light)' }}>
                <Lock size={18} style={{ color: 'var(--ochre)' }} />
                <span>パスワード</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ancient-input"
                placeholder="8文字以上"
                disabled={loading}
              />
            </div>

            <div className="text-right">
              <Link
                to="/reset"
                className="text-sm sm:text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--ochre)' }}
              >
                パスワードを忘れた場合
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mystic-button w-full text-base sm:text-base px-6 py-4 flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm sm:text-sm" style={{ color: 'var(--dim-light)' }}>
              アカウントをお持ちでない場合は
            </p>
            <Link
              to="/signup"
              className="text-base sm:text-base font-medium hover:opacity-80 transition-opacity inline-block mt-2"
              style={{ color: 'var(--pale-gold)' }}
            >
              新規登録はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
