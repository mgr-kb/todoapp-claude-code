import { Todo } from '@/types/todo';

export const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'プロジェクトの設計書を作成',
    description: '新しいWebアプリケーションの設計書を作成し、技術仕様を明確にする',
    dueDate: '2025-05-28',
    priority: 1,
    completed: false,
    createdAt: new Date('2025-05-25T09:00:00Z'),
    updatedAt: new Date('2025-05-25T09:00:00Z'),
  },
  {
    id: '2',
    title: 'データベースのマイグレーション',
    description: 'ユーザー認証機能のためのテーブル構造を作成する',
    dueDate: '2025-05-27',
    priority: 1,
    completed: false,
    createdAt: new Date('2025-05-24T14:30:00Z'),
    updatedAt: new Date('2025-05-24T14:30:00Z'),
  },
  {
    id: '3',
    title: 'ユーザーインターフェースのモックアップ作成',
    description: 'Figmaを使用してユーザーインターフェースのモックアップを作成する',
    dueDate: '2025-05-30',
    priority: 2,
    completed: true,
    createdAt: new Date('2025-05-23T11:15:00Z'),
    updatedAt: new Date('2025-05-26T16:45:00Z'),
  },
  {
    id: '4',
    title: 'APIエンドポイントの実装',
    description: 'REST APIのエンドポイントを実装し、フロントエンドとの連携を確立する',
    dueDate: '2025-06-01',
    priority: 2,
    completed: false,
    createdAt: new Date('2025-05-22T08:20:00Z'),
    updatedAt: new Date('2025-05-22T08:20:00Z'),
  },
  {
    id: '5',
    title: 'テストケースの作成',
    description: 'ユニットテストと統合テストのケースを作成し、品質を確保する',
    dueDate: '2025-06-03',
    priority: 3,
    completed: false,
    createdAt: new Date('2025-05-21T13:45:00Z'),
    updatedAt: new Date('2025-05-21T13:45:00Z'),
  },
  {
    id: '6',
    title: 'ドキュメントの整備',
    description: 'プロジェクトのREADMEとAPIドキュメントを整備する',
    dueDate: '2025-06-05',
    priority: 3,
    completed: false,
    createdAt: new Date('2025-05-20T10:30:00Z'),
    updatedAt: new Date('2025-05-20T10:30:00Z'),
  },
  {
    id: '7',
    title: 'セキュリティ監査',
    description: 'アプリケーションのセキュリティ脆弱性をチェックし、修正する',
    dueDate: '2025-05-29',
    priority: 1,
    completed: false,
    createdAt: new Date('2025-05-19T15:00:00Z'),
    updatedAt: new Date('2025-05-19T15:00:00Z'),
  },
  {
    id: '8',
    title: 'パフォーマンステスト',
    description: 'アプリケーションの負荷テストを実施し、パフォーマンスを最適化する',
    dueDate: '2025-06-07',
    priority: 2,
    completed: false,
    createdAt: new Date('2025-05-18T12:10:00Z'),
    updatedAt: new Date('2025-05-18T12:10:00Z'),
  },
  {
    id: '9',
    title: 'デプロイメントパイプラインの構築',
    description: 'CI/CDパイプラインを構築し、自動デプロイメントを設定する',
    dueDate: '2025-06-10',
    priority: 2,
    completed: false,
    createdAt: new Date('2025-05-17T09:25:00Z'),
    updatedAt: new Date('2025-05-17T09:25:00Z'),
  },
  {
    id: '10',
    title: 'ユーザーフィードバックの収集',
    description: 'ベータテスターからのフィードバックを収集し、改善点を特定する',
    dueDate: '2025-06-12',
    priority: 3,
    completed: false,
    createdAt: new Date('2025-05-16T14:40:00Z'),
    updatedAt: new Date('2025-05-16T14:40:00Z'),
  },
  {
    id: '11',
    title: 'モニタリング設定',
    description: 'アプリケーションの監視とログ収集システムを設定する',
    dueDate: '2025-06-15',
    priority: 3,
    completed: false,
    createdAt: new Date('2025-05-15T11:55:00Z'),
    updatedAt: new Date('2025-05-15T11:55:00Z'),
  },
  {
    id: '12',
    title: 'リリース準備',
    description: '本番環境へのリリース準備と最終チェックを行う',
    dueDate: '2025-06-20',
    priority: 1,
    completed: false,
    createdAt: new Date('2025-05-14T16:20:00Z'),
    updatedAt: new Date('2025-05-14T16:20:00Z'),
  },
];

// ソート用のユーティリティ関数
export function sortTodos(todos: Todo[], sortBy: 'dueDate' | 'priority' | 'createdAt' = 'dueDate'): Todo[] {
  return [...todos].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        // 期日が近い順（昇順）
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        // 優先度順（1が最高優先度）
        return a.priority - b.priority;
      case 'createdAt':
        // 作成日時が新しい順（降順）
        return b.createdAt.getTime() - a.createdAt.getTime();
      default:
        return 0;
    }
  });
}

// デフォルトソート: 期日が近い順 → 優先度順 → 作成日時が新しい順
export function getDefaultSortedTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    // 1. 期日が近い順
    const dueDateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (dueDateDiff !== 0) return dueDateDiff;
    
    // 2. 優先度順
    const priorityDiff = a.priority - b.priority;
    if (priorityDiff !== 0) return priorityDiff;
    
    // 3. 作成日時が新しい順
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

// ページネーション用のユーティリティ関数
export function paginateTodos(todos: Todo[], page: number = 1, limit: number = 10) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTodos = todos.slice(startIndex, endIndex);
  
  return {
    todos: paginatedTodos,
    totalCount: todos.length,
    totalPages: Math.ceil(todos.length / limit),
    currentPage: page,
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  
  test('mockTodosは12個のTODOアイテムを含む', () => {
    expect(mockTodos).toHaveLength(12);
  });
  
  test('sortTodosは期日順でソートする', () => {
    const sorted = sortTodos(mockTodos, 'dueDate');
    expect(new Date(sorted[0].dueDate).getTime()).toBeLessThanOrEqual(
      new Date(sorted[1].dueDate).getTime()
    );
  });
  
  test('sortTodosは優先度順でソートする', () => {
    const sorted = sortTodos(mockTodos, 'priority');
    expect(sorted[0].priority).toBeLessThanOrEqual(sorted[1].priority);
  });
  
  test('getDefaultSortedTodosはデフォルトソート順を適用する', () => {
    const sorted = getDefaultSortedTodos(mockTodos);
    expect(sorted).toHaveLength(mockTodos.length);
    // 最初のアイテムは期日が最も近いもの
    expect(sorted[0].dueDate).toBe('2025-05-27');
  });
  
  test('paginatetodosは正しくページネーションする', () => {
    const result = paginateTodos(mockTodos, 1, 5);
    expect(result.todos).toHaveLength(5);
    expect(result.totalCount).toBe(12);
    expect(result.totalPages).toBe(3);
    expect(result.currentPage).toBe(1);
  });
}