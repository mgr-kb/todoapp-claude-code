export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD format
  priority: 1 | 2 | 3; // 1: 高, 2: 中, 3: 低
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TodoPriority = Todo['priority'];

export interface TodoCreateInput {
  title: string;
  description: string;
  dueDate: string;
  priority: TodoPriority;
}

export interface TodoUpdateInput extends Partial<TodoCreateInput> {
  completed?: boolean;
}

// ソート基準の型定義
export type SortBy = 'dueDate' | 'priority' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface TodoSortOptions {
  sortBy: SortBy;
  sortOrder: SortOrder;
}

// ページネーション関連の型定義
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedTodos {
  todos: Todo[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  
  test('TodoPriorityは1,2,3のいずれかである', () => {
    const priorities: TodoPriority[] = [1, 2, 3];
    priorities.forEach(priority => {
      expect([1, 2, 3]).toContain(priority);
    });
  });
  
  test('TodoCreateInputは必須フィールドを持つ', () => {
    const input: TodoCreateInput = {
      title: 'Test Todo',
      description: 'Test Description',
      dueDate: '2025-05-27',
      priority: 1
    };
    expect(input.title).toBeDefined();
    expect(input.description).toBeDefined();
    expect(input.dueDate).toBeDefined();
    expect(input.priority).toBeDefined();
  });
}