import { Todo, TodoCreateInput, TodoUpdateInput, PaginatedTodos, TodoSortOptions, PaginationOptions } from '@/types/todo';
import { TodoBusinessLogic } from './TodoBusinessLogic';
import { RepositoryFactory } from '@/lib/factories/RepositoryFactory';

export class TodoServiceFacade {
  private businessLogic: TodoBusinessLogic;

  constructor() {
    const dataSource = RepositoryFactory.getDataSourceFromEnvironment();
    const todoRepository = RepositoryFactory.createTodoRepository(dataSource);
    const userRepository = RepositoryFactory.createUserRepository(dataSource);
    
    this.businessLogic = new TodoBusinessLogic(todoRepository, userRepository);
  }

  async createTodo(userId: string, data: TodoCreateInput): Promise<Todo> {
    return await this.businessLogic.createTodo(userId, data);
  }

  async getTodos(
    userId: string,
    sortOptions: TodoSortOptions = { sortBy: 'dueDate', sortOrder: 'asc' },
    paginationOptions: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedTodos> {
    return await this.businessLogic.getTodos(userId, sortOptions, paginationOptions);
  }

  async getTodoById(userId: string, id: string): Promise<Todo | null> {
    return await this.businessLogic.getTodoById(userId, id);
  }

  async updateTodo(userId: string, id: string, data: TodoUpdateInput): Promise<Todo | null> {
    return await this.businessLogic.updateTodo(userId, id, data);
  }

  async deleteTodo(userId: string, id: string): Promise<boolean> {
    return await this.businessLogic.deleteTodo(userId, id);
  }

  async toggleTodoCompletion(userId: string, id: string): Promise<Todo | null> {
    return await this.businessLogic.toggleTodoCompletion(userId, id);
  }

  async createUserIfNotExists(userId: string): Promise<void> {
    // This method exists for backward compatibility
    // The user creation is handled automatically in other methods
    if (!userId) {
      throw new Error('User ID is required');
    }
    // User creation is handled in the business logic layer when needed
  }
}