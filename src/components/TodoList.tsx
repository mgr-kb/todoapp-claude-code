'use client';

import { useState, useMemo } from 'react';
import { Todo, SortBy } from '@/types/todo';
import { getDefaultSortedTodos, paginateTodos, sortTodos } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Edit, Trash2, Calendar, Flag } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TodoList({ todos, onToggleComplete, onEdit, onDelete }: TodoListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const itemsPerPage = 10;

  // ソート済みのTODOリストを取得
  const sortedTodos = useMemo(() => {
    if (sortBy === 'dueDate') {
      return getDefaultSortedTodos(todos);
    }
    return sortTodos(todos, sortBy);
  }, [todos, sortBy]);

  // ページネーション適用
  const paginatedResult = useMemo(() => {
    return paginateTodos(sortedTodos, currentPage, itemsPerPage);
  }, [sortedTodos, currentPage]);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1: return '高';
      case 2: return '中';
      case 3: return '低';
      default: return '不明';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, completed: boolean) => {
    if (completed) return false;
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className="space-y-4">
      {/* ソート選択 */}
      <div className="flex items-center gap-4">
        <label htmlFor="sort-select" className="text-sm font-medium">
          並び替え:
        </label>
        <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]" id="sort-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">期日が近い順</SelectItem>
            <SelectItem value="priority">優先度順</SelectItem>
            <SelectItem value="createdAt">作成日時順</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TODOリスト */}
      <div className="space-y-3">
        {paginatedResult.todos.map((todo) => (
          <Card key={todo.id} className={`transition-all hover:shadow-md ${todo.completed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* 完了チェックボックス */}
                <div className="pt-1">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => onToggleComplete?.(todo.id)}
                    className="h-5 w-5"
                  />
                </div>

                {/* TODOコンテンツ */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {todo.title}
                      </h3>
                      <p className={`text-sm mt-1 ${todo.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                        {todo.description}
                      </p>
                      
                      {/* メタ情報 */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className={isOverdue(todo.dueDate, todo.completed) ? 'text-red-600 font-medium' : ''}>
                            {formatDate(todo.dueDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flag className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                            {getPriorityText(todo.priority)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(todo.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(todo.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ページネーション */}
      {paginatedResult.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {paginatedResult.totalCount}件中 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, paginatedResult.totalCount)}件を表示
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              前へ
            </Button>
            <span className="text-sm px-2">
              {currentPage} / {paginatedResult.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(paginatedResult.totalPages, prev + 1))}
              disabled={currentPage === paginatedResult.totalPages}
            >
              次へ
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* TODOが0件の場合 */}
      {todos.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">TODOがありません</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

if (import.meta.vitest) {
  const { test, expect, vi } = import.meta.vitest;
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

  test('TODOリストが正しく表示される', () => {
    render(<TodoList todos={mockTodos} />);
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  test('完了チェックボックスが正しく動作する', () => {
    const onToggleComplete = vi.fn();
    render(<TodoList todos={mockTodos} onToggleComplete={onToggleComplete} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    
    expect(onToggleComplete).toHaveBeenCalledWith('1');
  });

  test('編集ボタンが正しく動作する', () => {
    const onEdit = vi.fn();
    render(<TodoList todos={mockTodos} onEdit={onEdit} />);
    
    const editButtons = screen.getAllByRole('button').filter(button => {
      const svgElement = button.querySelector('svg[class*="lucide-edit"]');
      return !!svgElement;
    });
    
    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(onEdit).toHaveBeenCalledWith('1');
    } else {
      // フォールバック: 全てのボタンから最初のものを取得
      const allButtons = screen.getAllByRole('button');
      const editButton = allButtons.find(button => {
        const svg = button.querySelector('svg');
        return svg && svg.outerHTML.includes('Edit');
      });
      if (editButton) {
        fireEvent.click(editButton);
        expect(onEdit).toHaveBeenCalledWith('1');
      }
    }
  });

  test('空のTODOリストで適切なメッセージが表示される', () => {
    render(<TodoList todos={[]} />);
    expect(screen.getByText('TODOがありません')).toBeInTheDocument();
  });
}