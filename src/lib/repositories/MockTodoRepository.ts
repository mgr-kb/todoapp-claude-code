import { mockTodos } from '@/lib/mockData';
import { Todo, TodoCreateInput, TodoUpdateInput, PaginatedTodos, TodoSortOptions, PaginationOptions } from '@/types/todo';
import { ITodoRepository } from './interfaces/ITodoRepository';

export class MockTodoRepository implements ITodoRepository {
  private mockTodosList: Todo[] = [...mockTodos];

  async createTodo(userId: string, data: TodoCreateInput): Promise<Todo> {
    const newTodo: Todo = {
      id: this.generateId(),
      ...data,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockTodosList.push(newTodo);
    return newTodo;
  }

  async getTodos(
    userId: string,
    sortOptions: TodoSortOptions,
    paginationOptions: PaginationOptions
  ): Promise<PaginatedTodos> {
    const sortedTodos = this.sortTodos(this.mockTodosList, sortOptions);
    return this.paginateTodos(sortedTodos, paginationOptions);
  }

  async getTodoById(userId: string, id: string): Promise<Todo | null> {
    const todo = this.mockTodosList.find(t => t.id === id);
    return todo || null;
  }

  async updateTodo(userId: string, id: string, data: TodoUpdateInput): Promise<Todo | null> {
    const todoIndex = this.mockTodosList.findIndex(t => t.id === id);
    if (todoIndex === -1) {
      return null;
    }
    
    this.mockTodosList[todoIndex] = {
      ...this.mockTodosList[todoIndex],
      ...data,
      updatedAt: new Date(),
    };
    
    return this.mockTodosList[todoIndex];
  }

  async deleteTodo(userId: string, id: string): Promise<boolean> {
    const todoIndex = this.mockTodosList.findIndex(t => t.id === id);
    if (todoIndex === -1) {
      return false;
    }
    
    this.mockTodosList.splice(todoIndex, 1);
    return true;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private sortTodos(todos: Todo[], sortOptions: TodoSortOptions): Todo[] {
    const { sortBy, sortOrder } = sortOptions;
    
    return [...todos].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          if (comparison === 0) {
            comparison = a.priority - b.priority;
            if (comparison === 0) {
              comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
          }
          break;
        case 'priority':
          comparison = a.priority - b.priority;
          if (comparison === 0) {
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            if (comparison === 0) {
              comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
          }
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          if (comparison === 0) {
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            if (comparison === 0) {
              comparison = a.priority - b.priority;
            }
          }
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private paginateTodos(todos: Todo[], paginationOptions: PaginationOptions): PaginatedTodos {
    const { page, limit } = paginationOptions;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedTodos = todos.slice(startIndex, endIndex);
    const totalCount = todos.length;
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      todos: paginatedTodos,
      totalCount,
      totalPages,
      currentPage: page,
    };
  }
}