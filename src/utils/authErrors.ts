import { AuthError } from '@supabase/supabase-js';

export function getAuthErrorMessage(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'メールアドレスまたはパスワードが正しくありません';
    case 'Email not confirmed':
      return 'メールアドレスが確認されていません。確認メールをご確認ください';
    case 'User already registered':
      return 'このメールアドレスは既に登録されています';
    case 'Password should be at least 6 characters':
      return 'パスワードは8文字以上である必要があります';
    case 'Email rate limit exceeded':
      return 'メール送信回数の制限を超えました。しばらく待ってから再度お試しください';
    case 'Invalid email':
      return '有効なメールアドレスを入力してください';
    default:
      if (error.message.includes('rate limit')) {
        return '試行回数が多すぎます。しばらく待ってから再度お試しください';
      }
      if (error.message.includes('network')) {
        return 'ネットワークエラーが発生しました。接続を確認してください';
      }
      return error.message || '認証エラーが発生しました';
  }
}
