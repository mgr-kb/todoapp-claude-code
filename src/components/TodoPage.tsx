'use client';

import { useState } from 'react';
import { TodoList } from '@/components/TodoList';
import { Todo } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TodoPageProps {
  initialTodos: Todo[];
}

export function TodoPage({ initialTodos }: TodoPageProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const handleToggleComplete = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
        : todo
    ));
  };

  const handleEdit = (id: string) => {
    // TODO: 編集画面への遷移を実装
    console.log('Edit todo:', id);
  };

  const handleDelete = (id: string) => {
    // TODO: 削除確認ダイアログを実装
    if (confirm('このTODOを削除しますか？')) {
      setTodos(prev => prev.filter(todo => todo.id !== id));
    }
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
            </p>
          </div>
          <Button onClick={() => console.log('Add new todo')} className="gap-2">
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
      </div>
    </div>
  );
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  const { render, screen, fireEvent } = await import('@testing-library/react');
  
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
    render(<TodoPage initialTodos={mockTodos} />);
    expect(screen.getByText('TODO管理')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  test('統計情報が正しく表示される', () => {
    render(<TodoPage initialTodos={mockTodos} />);
    expect(screen.getByText('総TODO数')).toBeInTheDocument();
    expect(screen.getByText('完了済み')).toBeInTheDocument();
    expect(screen.getByText('未完了')).toBeInTheDocument();
  });

  test('TODOの完了状態が切り替わる', () => {
    render(<TodoPage initialTodos={mockTodos} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    
    fireEvent.click(checkboxes[0]); // 最初のTODOを完了に
    
    // 統計が更新されることを確認 - より具体的な要素を検索
    const completedStats = screen.getByText('完了済み').parentElement;
    expect(completedStats?.querySelector('.text-2xl')).toHaveTextContent('2');
  });
}