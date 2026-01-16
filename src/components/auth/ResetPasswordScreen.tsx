import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAuthErrorMessage } from '../../utils/authErrors';

export function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

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

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(getAuthErrorMessage(error));
      } else {
        setSuccess(true);
        setEmail('');
      }
    } catch (err) {
      setError('パスワードリセットメールの送信中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="scroll-panel max-w-md w-full relative p-5 sm:p-6 md:p-8 lg:p-10">
        <div className="relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-5 sm:mb-6 relative" style={{
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

            <h2 className="text-2xl sm:text-3xl font-bold mb-2 glow-text" style={{ color: 'var(--pale-gold)' }}>
              パスワードリセット
            </h2>

            <p className="text-xs sm:text-sm opacity-75 leading-relaxed" style={{ color: 'var(--dim-light)' }}>
              登録されたメールアドレスを入力してください。<br />
              パスワードリセット用のリンクをお送りします。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="p-3 rounded-lg text-sm" style={{
                background: 'rgba(122, 29, 46, 0.2)',
                border: '1px solid var(--torii-red)',
                color: 'var(--torii-red)'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg text-sm" style={{
                background: 'rgba(82, 166, 124, 0.2)',
                border: '1px solid rgba(82, 166, 124, 0.6)',
                color: 'var(--pale-gold)'
              }}>
                パスワードリセット用のメールを送信しました。<br />
                メールをご確認ください。
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium" style={{ color: 'var(--pale-light)' }}>
                <Mail size={16} style={{ color: 'var(--ochre)' }} />
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

            <button
              type="submit"
              disabled={loading}
              className="mystic-button w-full text-sm sm:text-base px-6 py-3 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {loading ? '送信中...' : 'リセットメールを送信'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="text-sm sm:text-base hover:opacity-80 transition-opacity inline-block"
              style={{ color: 'var(--ochre)' }}
            >
              ログイン画面に戻る
            </Link>
            <div>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--dim-light)' }}>
                アカウントをお持ちでない場合は
              </p>
              <Link
                to="/signup"
                className="text-sm sm:text-base font-medium hover:opacity-80 transition-opacity inline-block mt-1"
                style={{ color: 'var(--pale-gold)' }}
              >
                新規登録はこちら
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
