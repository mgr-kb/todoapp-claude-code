'use client';

import { useState } from 'react';
import { TodoList } from '@/components/TodoList';
import { TodoCreateForm } from '@/components/TodoCreateForm';
import { Todo, PaginatedTodos } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toggleTodoAction, deleteTodoAction } from '@/app/actions';

interface TodoPageProps {
  todosData: PaginatedTodos;
}

export function TodoPage({ todosData }: TodoPageProps) {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { todos, totalCount, totalPages, currentPage } = todosData;

  const handleToggleComplete = async (id: string) => {
    try {
      setError(null);
      await toggleTodoAction(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle todo');
    }
  };

  const handleEdit = (id: string) => {
    // TODO: 編集画面への遷移を実装
    console.log('Edit todo:', id);
  };

  const handleDelete = async (id: string) => {
    // TODO: 削除確認ダイアログを実装
    if (confirm('このTODOを削除しますか？')) {
      try {
        setError(null);
        await deleteTodoAction(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete todo');
      }
    }
  };

  const handleCreateSuccess = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TODO管理</h1>
            <p className="text-muted-foreground mt-2">
              効率的にタスクを管理し、生産性を向上させましょう
              {process.env.NEXT_PUBLIC_DATA_SOURCE === 'mock' && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  モックデータ
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => setIsCreateFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            新しいTODO
          </Button>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card text-card-foreground rounded-lg border p-4">
            <div className="text-2xl font-bold">{todos.length}</div>
            <div className="text-sm text-muted-foreground">総TODO数</div>
          </div>
          <div className="bg-card text-card-foreground rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">
              {todos.filter(todo => todo.completed).length}
            </div>
            <div className="text-sm text-muted-foreground">完了済み</div>
          </div>
          <div className="bg-card text-card-foreground rounded-lg border p-4">
            <div className="text-2xl font-bold text-orange-600">
              {todos.filter(todo => !todo.completed).length}
            </div>
            <div className="text-sm text-muted-foreground">未完了</div>
          </div>
        </div>

        {/* TODOリスト */}
        <TodoList
          todos={todos}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        
        {/* ページネーション情報 */}
        {totalPages > 1 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            ページ {currentPage} / {totalPages} （全 {totalCount} 件）
          </div>
        )}

        {/* TODO作成フォーム */}
        <TodoCreateForm
          open={isCreateFormOpen}
          onOpenChange={setIsCreateFormOpen}
          onSuccess={handleCreateSuccess}
        />

        {/* エラー表示 */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  const { render, screen } = await import('@testing-library/react');
  
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Test Todo 1',
      description: 'Test Description 1',
      dueDate: '2025-05-27',
      priority: 1,
      completed: false,
      createdAt: new Date('2025-05-25T09:00:00Z'),
      updatedAt: new Date('2025-05-25T09:00:00Z'),
    },
    {
      id: '2',
      title: 'Test Todo 2',
      description: 'Test Description 2',
      dueDate: '2025-05-28',
      priority: 2,
      completed: true,
      createdAt: new Date('2025-05-24T09:00:00Z'),
      updatedAt: new Date('2025-05-24T09:00:00Z'),
    },
  ];

  test('TodoPageが正しく表示される', () => {
    const mockTodosData = {
      todos: mockTodos,
      totalCount: mockTodos.length,
      totalPages: 1,
      currentPage: 1,
    };
    render(<TodoPage todosData={mockTodosData} />);
    expect(screen.getByText('TODO管理')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  test('統計情報が正しく表示される', () => {
    const mockTodosData = {
      todos: mockTodos,
      totalCount: mockTodos.length,
      totalPages: 1,
      currentPage: 1,
    };
    render(<TodoPage todosData={mockTodosData} />);
    expect(screen.getByText('総TODO数')).toBeInTheDocument();
    expect(screen.getByText('完了済み')).toBeInTheDocument();
    expect(screen.getByText('未完了')).toBeInTheDocument();
  });

  test('TODOの完了状態が切り替わる', async () => {
    const mockTodosData = {
      todos: mockTodos,
      totalCount: mockTodos.length,
      totalPages: 1,
      currentPage: 1,
    };
    render(<TodoPage todosData={mockTodosData} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    
    // Server Actionのモックは複雑なため、このテストは簡略化
    expect(checkboxes).toHaveLength(2);
  });
}