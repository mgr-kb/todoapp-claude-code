import { useState, useEffect, useCallback } from 'react';
import { Todo, PaginatedTodos, TodoCreateInput, TodoUpdateInput, TodoSortOptions, PaginationOptions } from '@/types/todo';

interface UseTodosResult {
  todos: Todo[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  createTodo: (data: TodoCreateInput) => Promise<void>;
  updateTodo: (id: string, data: TodoUpdateInput) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  refreshTodos: () => Promise<void>;
}

export function useTodos(
  sortOptions: TodoSortOptions = { sortBy: 'dueDate', sortOrder: 'asc' },
  paginationOptions: PaginationOptions = { page: 1, limit: 10 }
): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: paginationOptions.page.toString(),
        limit: paginationOptions.limit.toString(),
        sortBy: sortOptions.sortBy,
        sortOrder: sortOptions.sortOrder,
      });

      const response = await fetch(`/api/todos?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }

      const data: PaginatedTodos = await response.json();
      
      setTodos(data.todos);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, [sortOptions.sortBy, sortOptions.sortOrder, paginationOptions.page, paginationOptions.limit]);

  const createTodo = async (data: TodoCreateInput) => {
    try {
      setError(null);
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create todo');
      }

      await fetchTodos(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
      throw err;
    }
  };

  const updateTodo = async (id: string, data: TodoUpdateInput) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      await fetchTodos(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      throw err;
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      await fetchTodos(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      throw err;
    }
  };

  const toggleComplete = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    await updateTodo(id, { completed: !todo.completed });
  };

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    totalCount,
    totalPages,
    currentPage,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    refreshTodos: fetchTodos,
  };
}