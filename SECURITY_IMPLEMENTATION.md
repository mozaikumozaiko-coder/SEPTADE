# セキュリティ実装完了ガイド

このドキュメントでは、プロジェクトに実装されたセキュリティ機能と、残りの手動設定について説明します。

## ✅ 実装済みのセキュリティ機能（コードレベル）

### 1. パスワード漏洩検証

**実装場所:** `src/utils/passwordSecurity.ts`

**機能:**
- HaveIBeenPwned APIを使用して、パスワードが過去のデータ漏洩で公開されていないかチェック
- SHA-1ハッシュを使用した安全なk-Anonymity方式での検証
- プレーンテキストのパスワードは送信されません

**使用方法:**
```typescript
import { validatePassword } from './utils/passwordSecurity';

const result = await validatePassword(password);
if (!result.isValid) {
  console.error(result.errors);
}
```

**検証内容:**
- 最小8文字
- 小文字を含む
- 大文字を含む
- 数字を含む
- データ漏洩履歴のチェック

### 2. 新規登録時のパスワード検証

**実装場所:** `src/components/auth/SignUpScreen.tsx`

**機能:**
- ユーザーが新規登録する際、自動的にパスワードの強度と漏洩履歴をチェック
- リアルタイムのフィードバックを提供
- 漏洩が確認されたパスワードは拒否

**ユーザー体験:**
1. ユーザーがフォームを送信
2. 「パスワード検証中...」と表示
3. セキュリティチェック完了後、登録処理へ

### 3. Row Level Security（RLS）

**実装場所:** Supabaseデータベースマイグレーション

**保護されているテーブル:**
- `diagnosis_history` - ユーザーは自分の診断履歴のみアクセス可能
- `user_profiles` - ユーザーは自分のプロフィールのみアクセス可能

**ポリシー:**
- SELECT: `auth.uid() = user_id` による所有権検証
- INSERT: `auth.uid() = user_id` による所有権検証
- UPDATE: `auth.uid() = user_id` による所有権検証
- DELETE: `auth.uid() = user_id` による所有権検証

### 4. SQL関数のセキュリティ

**実装場所:** `supabase/migrations/fix_function_search_path.sql`

**改善内容:**
- `verify_rls_enabled()` 関数に不変のsearch_pathを設定
- `SET search_path = pg_catalog, public` によるインジェクション攻撃の防止
- SECURITY DEFINERでの安全な実行

## ⚠️ 手動設定が必要な項目（Supabaseダッシュボード）

以下の設定は、Supabaseダッシュボードで手動で設定する必要があります。

### 1. Auth DB接続戦略（推奨）

**目的:** Auth serverの接続プールをパーセンテージベースに変更し、スケーラビリティを向上

**設定手順:**
1. Supabaseダッシュボードを開く
2. Settings → Database に移動
3. Connection Pooling セクションを見つける
4. Auth Server Connection Pool を「Fixed Number (10)」から「Percentage-Based」に変更
5. 15-20% に設定（推奨）
6. 保存

**影響:** パフォーマンス向上とスケーラビリティの改善

### 2. 匿名サインインの無効化（推奨）

**目的:** 認証されていないユーザーのアクセスを防ぐ

**設定手順:**
1. Supabaseダッシュボードを開く
2. Authentication → Providers に移動
3. Anonymous Sign-ins を見つける
4. トグルをOFFにする
5. 保存

**影響:** このアプリはメール/パスワード認証のみを使用するため、匿名アクセスは不要

### 3. 漏洩パスワード保護（オプション - クライアント側で実装済み）

**目的:** Supabase側でも漏洩パスワードをチェック

**設定手順:**
1. Supabaseダッシュボードを開く
2. Authentication → Policies または Settings に移動
3. Password Protection または Security セクションを見つける
4. "Check passwords against HaveIBeenPwned.org" を有効化
5. 保存

**注意:** この機能はクライアント側で既に実装されているため、Supabase側の設定はオプションです。

## 🔒 セキュリティベストプラクティス

### 実装されている保護

1. **認証検証**
   - すべてのデータベースアクセスで `auth.uid()` による認証確認
   - 未認証ユーザーはデータにアクセス不可

2. **所有権検証**
   - ユーザーは自分のデータのみアクセス可能
   - 他のユーザーのデータは完全に隔離

3. **SQL インジェクション対策**
   - Supabaseクライアントライブラリのパラメータ化されたクエリ
   - 関数のsearch_path設定

4. **パスワードセキュリティ**
   - 強力なパスワード要件（8文字以上、大小英数字）
   - 漏洩パスワードの検出と拒否
   - HaveIBeenPwned APIとの統合

5. **セッション管理**
   - Supabase Authによる安全なセッション管理
   - トークンベースの認証

## 📊 セキュリティ検証

### データベースRLSの確認

データベースでRLSが正しく設定されているか確認：

```sql
SELECT * FROM verify_rls_enabled();
```

すべてのテーブルで `rls_enabled = true` かつ `policy_count > 0` であることを確認してください。

### パスワード検証のテスト

開発環境でテストする場合：

```typescript
// 弱いパスワード
await validatePassword('password'); // エラー: 漏洩履歴あり

// 強いパスワード
await validatePassword('MyStr0ngP@ss2024'); // 成功（漏洩がない場合）
```

## 🚀 本番環境デプロイ前のチェックリスト

- [ ] すべてのテーブルでRLSが有効
- [ ] すべてのテーブルに適切なRLSポリシーが設定されている
- [ ] パスワード検証が動作している
- [ ] 環境変数（`.env`）が正しく設定されている
- [ ] Supabaseダッシュボードで推奨設定を確認
- [ ] Auth DB接続戦略をパーセンテージベースに変更（推奨）
- [ ] 匿名サインインを無効化（推奨）

## 📝 注意事項

1. **環境変数の保護**
   - `.env` ファイルをGitにコミットしない
   - 本番環境では環境変数を安全に管理

2. **APIキーの管理**
   - `VITE_SUPABASE_ANON_KEY` は公開しても安全（RLSで保護）
   - `SUPABASE_SERVICE_ROLE_KEY` は絶対に公開しない

3. **定期的なセキュリティレビュー**
   - RLSポリシーの定期的な見直し
   - パスワードポリシーの更新
   - 依存関係の脆弱性チェック

## 🔗 参考リンク

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [OWASP パスワードセキュリティ](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
