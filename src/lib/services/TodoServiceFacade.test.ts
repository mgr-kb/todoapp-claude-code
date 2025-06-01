import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoServiceFacade } from './TodoServiceFacade';
import { TodoBusinessLogic } from './TodoBusinessLogic';
import { RepositoryFactory } from '@/lib/factories/RepositoryFactory';
import { TodoCreateInput, TodoUpdateInput, Todo } from '@/types/todo';

// Mock dependencies
vi.mock('./TodoBusinessLogic');
vi.mock('@/lib/factories/RepositoryFactory');

describe('TodoServiceFacade', () => {
  let todoServiceFacade: TodoServiceFacade;
  let mockBusinessLogic: TodoBusinessLogic;

  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    dueDate: '2024-12-31',
    priority: 2,
    completed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPaginatedResult = {
    todos: [mockTodo],
    totalCount: 1,
    totalPages: 1,
    currentPage: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock repository factory
    const mockTodoRepository = {
      createTodo: vi.fn(),
      getTodos: vi.fn(),
      getTodoById: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn(),
    };

    const mockUserRepository = {
      createUserIfNotExists: vi.fn(),
    };

    vi.mocked(RepositoryFactory.getDataSourceFromEnvironment).mockReturnValue('database');
    vi.mocked(RepositoryFactory.createTodoRepository).mockReturnValue(mockTodoRepository);
    vi.mocked(RepositoryFactory.createUserRepository).mockReturnValue(mockUserRepository);

    // Mock business logic
    mockBusinessLogic = {
      createTodo: vi.fn(),
      getTodos: vi.fn(),
      getTodoById: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn(),
      toggleTodoCompletion: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    vi.mocked(TodoBusinessLogic).mockImplementation(() => mockBusinessLogic);

    todoServiceFacade = new TodoServiceFacade();
  });

  describe('constructor', () => {
    it('should initialize with proper repository instances', () => {
      expect(RepositoryFactory.getDataSourceFromEnvironment).toHaveBeenCalled();
      expect(RepositoryFactory.createTodoRepository).toHaveBeenCalledWith('database');
      expect(RepositoryFactory.createUserRepository).toHaveBeenCalledWith('database');
      expect(TodoBusinessLogic).toHaveBeenCalled();
    });
  });

  describe('createTodo', () => {
    it('should delegate to business logic', async () => {
      const input: TodoCreateInput = {
        title: 'Test Todo',
        description: 'Test Description',
        dueDate: '2024-12-31',
        priority: 2,
      };

      vi.mocked(mockBusinessLogic.createTodo).mockResolvedValue(mockTodo);

      const result = await todoServiceFacade.createTodo('user123', input);

      expect(mockBusinessLogic.createTodo).toHaveBeenCalledWith('user123', input);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('getTodos', () => {
    it('should delegate to business logic with default options', async () => {
      vi.mocked(mockBusinessLogic.getTodos).mockResolvedValue(mockPaginatedResult);

      const result = await todoServiceFacade.getTodos('user123');

      expect(mockBusinessLogic.getTodos).toHaveBeenCalledWith(
        'user123',
        { sortBy: 'dueDate', sortOrder: 'asc' },
        { page: 1, limit: 10 }
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should delegate to business logic with custom options', async () => {
      vi.mocked(mockBusinessLogic.getTodos).mockResolvedValue(mockPaginatedResult);

      const sortOptions = { sortBy: 'priority' as const, sortOrder: 'desc' as const };
      const paginationOptions = { page: 2, limit: 20 };

      const result = await todoServiceFacade.getTodos('user123', sortOptions, paginationOptions);

      expect(mockBusinessLogic.getTodos).toHaveBeenCalledWith('user123', sortOptions, paginationOptions);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('getTodoById', () => {
    it('should delegate to business logic', async () => {
      vi.mocked(mockBusinessLogic.getTodoById).mockResolvedValue(mockTodo);

      const result = await todoServiceFacade.getTodoById('user123', '1');

      expect(mockBusinessLogic.getTodoById).toHaveBeenCalledWith('user123', '1');
      expect(result).toEqual(mockTodo);
    });

    it('should return null for non-existent todo', async () => {
      vi.mocked(mockBusinessLogic.getTodoById).mockResolvedValue(null);

      const result = await todoServiceFacade.getTodoById('user123', '999');

      expect(result).toBeNull();
    });
  });

  describe('updateTodo', () => {
    it('should delegate to business logic', async () => {
      const updateData: TodoUpdateInput = {
        title: 'Updated Title',
        completed: true,
      };

      const updatedTodo = { ...mockTodo, ...updateData };
      vi.mocked(mockBusinessLogic.updateTodo).mockResolvedValue(updatedTodo);

      const result = await todoServiceFacade.updateTodo('user123', '1', updateData);

      expect(mockBusinessLogic.updateTodo).toHaveBeenCalledWith('user123', '1', updateData);
      expect(result).toEqual(updatedTodo);
    });
  });

  describe('deleteTodo', () => {
    it('should delegate to business logic', async () => {
      vi.mocked(mockBusinessLogic.deleteTodo).mockResolvedValue(true);

      const result = await todoServiceFacade.deleteTodo('user123', '1');

      expect(mockBusinessLogic.deleteTodo).toHaveBeenCalledWith('user123', '1');
      expect(result).toBe(true);
    });

    it('should return false for non-existent todo', async () => {
      vi.mocked(mockBusinessLogic.deleteTodo).mockResolvedValue(false);

      const result = await todoServiceFacade.deleteTodo('user123', '999');

      expect(result).toBe(false);
    });
  });

  describe('toggleTodoCompletion', () => {
    it('should delegate to business logic', async () => {
      const toggledTodo = { ...mockTodo, completed: true };
      vi.mocked(mockBusinessLogic.toggleTodoCompletion).mockResolvedValue(toggledTodo);

      const result = await todoServiceFacade.toggleTodoCompletion('user123', '1');

      expect(mockBusinessLogic.toggleTodoCompletion).toHaveBeenCalledWith('user123', '1');
      expect(result).toEqual(toggledTodo);
    });

    it('should return null for non-existent todo', async () => {
      vi.mocked(mockBusinessLogic.toggleTodoCompletion).mockResolvedValue(null);

      const result = await todoServiceFacade.toggleTodoCompletion('user123', '999');

      expect(result).toBeNull();
    });
  });

  describe('createUserIfNotExists', () => {
    it('should throw error when userId is empty', async () => {
      await expect(todoServiceFacade.createUserIfNotExists(''))
        .rejects.toThrow('User ID is required');
    });

    it('should not throw error for valid userId', async () => {
      await expect(todoServiceFacade.createUserIfNotExists('user123'))
        .resolves.not.toThrow();
    });
  });
});