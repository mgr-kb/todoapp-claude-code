import { Todo, TodoCreateInput, TodoUpdateInput, PaginatedTodos, TodoSortOptions, PaginationOptions } from '@/types/todo';
import { ITodoRepository } from '@/lib/repositories/interfaces/ITodoRepository';
import { IUserRepository } from '@/lib/repositories/interfaces/IUserRepository';

export class TodoBusinessLogic {
  constructor(
    private todoRepository: ITodoRepository,
    private userRepository: IUserRepository
  ) {}

  async createTodo(userId: string, data: TodoCreateInput): Promise<Todo> {
    await this.ensureUserExists(userId);
    this.validateTodoInput(data);
    return await this.todoRepository.createTodo(userId, data);
  }

  async getTodos(
    userId: string,
    sortOptions: TodoSortOptions = { sortBy: 'dueDate', sortOrder: 'asc' },
    paginationOptions: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedTodos> {
    await this.ensureUserExists(userId);
    this.validateSortOptions(sortOptions);
    this.validatePaginationOptions(paginationOptions);
    return await this.todoRepository.getTodos(userId, sortOptions, paginationOptions);
  }

  async getTodoById(userId: string, id: string): Promise<Todo | null> {
    this.validateId(id);
    return await this.todoRepository.getTodoById(userId, id);
  }

  async updateTodo(userId: string, id: string, data: TodoUpdateInput): Promise<Todo | null> {
    this.validateId(id);
    this.validateUpdateInput(data);
    return await this.todoRepository.updateTodo(userId, id, data);
  }

  async deleteTodo(userId: string, id: string): Promise<boolean> {
    this.validateId(id);
    return await this.todoRepository.deleteTodo(userId, id);
  }

  async toggleTodoCompletion(userId: string, id: string): Promise<Todo | null> {
    const todo = await this.getTodoById(userId, id);
    if (!todo) {
      return null;
    }
    return await this.updateTodo(userId, id, { completed: !todo.completed });
  }

  private async ensureUserExists(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    await this.userRepository.createUserIfNotExists(userId);
  }

  private validateTodoInput(data: TodoCreateInput): void {
    if (!data.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!data.description?.trim()) {
      throw new Error('Description is required');
    }
    if (!data.dueDate) {
      throw new Error('Due date is required');
    }
    if (!this.isValidDate(data.dueDate)) {
      throw new Error('Invalid due date format');
    }
    if (!this.isValidPriority(data.priority)) {
      throw new Error('Priority must be 1, 2, or 3');
    }
  }

  private validateUpdateInput(data: TodoUpdateInput): void {
    if (data.title !== undefined && !data.title.trim()) {
      throw new Error('Title cannot be empty');
    }
    if (data.description !== undefined && !data.description.trim()) {
      throw new Error('Description cannot be empty');
    }
    if (data.dueDate !== undefined && !this.isValidDate(data.dueDate)) {
      throw new Error('Invalid due date format');
    }
    if (data.priority !== undefined && !this.isValidPriority(data.priority)) {
      throw new Error('Priority must be 1, 2, or 3');
    }
  }

  private validateId(id: string): void {
    if (!id?.trim()) {
      throw new Error('ID is required');
    }
  }

  private validateSortOptions(sortOptions: TodoSortOptions): void {
    const validSortFields = ['dueDate', 'priority', 'createdAt'];
    const validSortOrders = ['asc', 'desc'];
    
    if (!validSortFields.includes(sortOptions.sortBy)) {
      throw new Error('Invalid sort field');
    }
    if (!validSortOrders.includes(sortOptions.sortOrder)) {
      throw new Error('Invalid sort order');
    }
  }

  private validatePaginationOptions(paginationOptions: PaginationOptions): void {
    if (paginationOptions.page < 1) {
      throw new Error('Page must be greater than 0');
    }
    if (paginationOptions.limit < 1 || paginationOptions.limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && Boolean(dateString.match(/^\d{4}-\d{2}-\d{2}$/));
  }

  private isValidPriority(priority: number): boolean {
    return [1, 2, 3].includes(priority);
  }
}