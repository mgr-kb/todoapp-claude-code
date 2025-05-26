# CLAUDE.md - TODOリストアプリケーション開発ガイド

## プロジェクト概要
Next.js v15 (App Router) + React.js v19を使用したTODOリストアプリケーション

## 技術スタック
- **フロントエンド**: Next.js v15 (App Router), React.js v19, TypeScript
- **UIライブラリ**: shadcn/ui
- **ORM**: Prisma
- **認証**: Clerk
- **データベース**: Supabase (PostgreSQL)
- **ホスティング**: Vercel

## 開発コマンド
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# リント
npm run lint

# 型チェック
npm run type-check
```

## プロジェクト構造
```
src/
├── app/           # Next.js App Router
├── components/    # Reactコンポーネント
├── lib/          # ユーティリティ関数
└── types/        # TypeScript型定義
```

## 主要機能
1. **TODO管理**
   - TODO一覧表示（ソート・ページネーション）
   - TODO追加・編集・削除
   - 完了状態の更新

2. **ユーザー認証**
   - Clerkによる認証
   - ユーザー別データ管理

## TODOデータ構造
```typescript
interface Todo {
  id: string;           // UUID/Integer
  title: string;        // タイトル（必須）
  description: string;  // 詳細説明（必須）
  dueDate: string;      // 期日 YYYY-MM-DD（必須）
  priority: number;     // 優先度 1:高 2:中 3:低（必須）
  completed: boolean;   // 完了状態（必須）
  createdAt: Date;      // 作成日時
  updatedAt: Date;      // 更新日時
}
```

## デフォルトソート順
1. 期日が近い順
2. 優先度順
3. 作成日時が新しい順

## ページング
- 1ページあたり10件表示

## エラーハンドリング
- 一覧表示エラー: 画面上部にメッセージ表示
- 操作エラー（追加・編集・削除・完了）: ダイアログで通知

## UI/UX要件
- shadcn/uiを活用した美しいデザイン
- 直感的で軽快な操作感
- 適切なローディング表示
- レスポンシブデザイン

## セキュリティ
- Clerkによる認証・認可
- ユーザー別データ分離

## 開発時の注意点
- TypeScriptの型安全性を重視
- shadcn/uiコンポーネントの活用
- エラーハンドリングの適切な実装
- パフォーマンスを考慮した実装


## タスク着手時のワークフロー

1. タスクの状態を「着手中」に変更
2. タスクの開始日時を設定 (時間まで記載すること)
3. Git で main からブランチを作成 (ブランチ名は`feature/<タスクID>`とする)
4. 空コミットを作成 (コミットメッセージは`chore: start feature/<タスクID>`とする)
5. PR を作成 (`gh pr create --assignee @me --base main --draft`)
  - タイトルはタスクのタイトルを参照する (`【<タスクID>】<タイトル>`)
  - ボディはタスクの内容から生成する (Notion タスクへのリンクを含める)
6. 実装計画を考えて、ユーザーに伝える
7. ユーザーにプロンプトを返す

## タスク完了時のワークフロー

1. PR のステータスを ready にする
2. PR をマージ (`gh pr merge --merge --auto --delete-branch`)
3. タスクの開始日時を設定 (時間まで記載すること)
4. タスクに「サマリー」を追加
  - コマンドライン履歴とコンテキストを参照して、振り返りを効率かするための文章を作成
  - Notion の見出しは「振り返り」とする
5. タスクの状態を「完了」に変更
6. タスクの完了日時を記載 (時間まで記載すること)
7. ユーザーにプロンプトを返す