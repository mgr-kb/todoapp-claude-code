import { Todo, TodoCreateInput, TodoUpdateInput, PaginatedTodos, TodoSortOptions, PaginationOptions } from '@/types/todo';

export interface ITodoRepository {
  createTodo(userId: string, data: TodoCreateInput): Promise<Todo>;
  getTodos(userId: string, sortOptions: TodoSortOptions, paginationOptions: PaginationOptions): Promise<PaginatedTodos>;
  getTodoById(userId: string, id: string): Promise<Todo | null>;
  updateTodo(userId: string, id: string, data: TodoUpdateInput): Promise<Todo | null>;
  deleteTodo(userId: string, id: string): Promise<boolean>;
}