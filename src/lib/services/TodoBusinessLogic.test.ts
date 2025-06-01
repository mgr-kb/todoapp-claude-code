/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoBusinessLogic } from './TodoBusinessLogic';
import { ITodoRepository } from '@/lib/repositories/interfaces/ITodoRepository';
import { IUserRepository } from '@/lib/repositories/interfaces/IUserRepository';
import { TodoCreateInput, TodoUpdateInput, Todo } from '@/types/todo';

describe('TodoBusinessLogic', () => {
  let todoBusinessLogic: TodoBusinessLogic;
  let mockTodoRepository: ITodoRepository;
  let mockUserRepository: IUserRepository;

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

  beforeEach(() => {
    mockTodoRepository = {
      createTodo: vi.fn(),
      getTodos: vi.fn(),
      getTodoById: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn(),
    };

    mockUserRepository = {
      createUserIfNotExists: vi.fn(),
    };

    todoBusinessLogic = new TodoBusinessLogic(mockTodoRepository, mockUserRepository);
  });

  describe('createTodo', () => {
    const validInput: TodoCreateInput = {
      title: 'Test Todo',
      description: 'Test Description',
      dueDate: '2024-12-31',
      priority: 2,
    };

    it('should create a todo successfully', async () => {
      vi.mocked(mockTodoRepository.createTodo).mockResolvedValue(mockTodo);

      const result = await todoBusinessLogic.createTodo('user123', validInput);

      expect(mockUserRepository.createUserIfNotExists).toHaveBeenCalledWith('user123');
      expect(mockTodoRepository.createTodo).toHaveBeenCalledWith('user123', validInput);
      expect(result).toEqual(mockTodo);
    });

    it('should throw error when userId is empty', async () => {
      await expect(todoBusinessLogic.createTodo('', validInput))
        .rejects.toThrow('User ID is required');
    });

    it('should throw error when title is empty', async () => {
      const invalidInput = { ...validInput, title: '  ' };
      
      await expect(todoBusinessLogic.createTodo('user123', invalidInput))
        .rejects.toThrow('Title is required');
    });

    it('should throw error when description is empty', async () => {
      const invalidInput = { ...validInput, description: '  ' };
      
      await expect(todoBusinessLogic.createTodo('user123', invalidInput))
        .rejects.toThrow('Description is required');
    });

    it('should throw error when dueDate is missing', async () => {
      const invalidInput = { ...validInput, dueDate: '' };
      
      await expect(todoBusinessLogic.createTodo('user123', invalidInput))
        .rejects.toThrow('Due date is required');
    });

    it('should throw error when dueDate format is invalid', async () => {
      const invalidInput = { ...validInput, dueDate: '2024/12/31' };
      
      await expect(todoBusinessLogic.createTodo('user123', invalidInput))
        .rejects.toThrow('Invalid due date format');
    });

    it('should throw error when priority is invalid', async () => {
      const invalidInput = { ...validInput, priority: 4 as any };
      
      await expect(todoBusinessLogic.createTodo('user123', invalidInput))
        .rejects.toThrow('Priority must be 1, 2, or 3');
    });
  });

  describe('getTodos', () => {
    const mockPaginatedResult = {
      todos: [mockTodo],
      totalCount: 1,
      totalPages: 1,
      currentPage: 1,
    };

    it('should get todos successfully', async () => {
      vi.mocked(mockTodoRepository.getTodos).mockResolvedValue(mockPaginatedResult);

      const result = await todoBusinessLogic.getTodos('user123');

      expect(mockUserRepository.createUserIfNotExists).toHaveBeenCalledWith('user123');
      expect(mockTodoRepository.getTodos).toHaveBeenCalledWith(
        'user123',
        { sortBy: 'dueDate', sortOrder: 'asc' },
        { page: 1, limit: 10 }
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should throw error for invalid sort field', async () => {
      await expect(
        todoBusinessLogic.getTodos('user123', { sortBy: 'invalid' as any, sortOrder: 'asc' })
      ).rejects.toThrow('Invalid sort field');
    });

    it('should throw error for invalid sort order', async () => {
      await expect(
        todoBusinessLogic.getTodos('user123', { sortBy: 'dueDate', sortOrder: 'invalid' as any })
      ).rejects.toThrow('Invalid sort order');
    });

    it('should throw error for page less than 1', async () => {
      await expect(
        todoBusinessLogic.getTodos('user123', undefined, { page: 0, limit: 10 })
      ).rejects.toThrow('Page must be greater than 0');
    });

    it('should throw error for limit less than 1', async () => {
      await expect(
        todoBusinessLogic.getTodos('user123', undefined, { page: 1, limit: 0 })
      ).rejects.toThrow('Limit must be between 1 and 100');
    });

    it('should throw error for limit greater than 100', async () => {
      await expect(
        todoBusinessLogic.getTodos('user123', undefined, { page: 1, limit: 101 })
      ).rejects.toThrow('Limit must be between 1 and 100');
    });
  });

  describe('getTodoById', () => {
    it('should get a todo by id successfully', async () => {
      vi.mocked(mockTodoRepository.getTodoById).mockResolvedValue(mockTodo);

      const result = await todoBusinessLogic.getTodoById('user123', '1');

      expect(mockTodoRepository.getTodoById).toHaveBeenCalledWith('user123', '1');
      expect(result).toEqual(mockTodo);
    });

    it('should return null for non-existent todo', async () => {
      vi.mocked(mockTodoRepository.getTodoById).mockResolvedValue(null);

      const result = await todoBusinessLogic.getTodoById('user123', '999');

      expect(result).toBeNull();
    });

    it('should throw error for empty id', async () => {
      await expect(todoBusinessLogic.getTodoById('user123', '  '))
        .rejects.toThrow('ID is required');
    });
  });

  describe('updateTodo', () => {
    const validUpdate: TodoUpdateInput = {
      title: 'Updated Title',
      completed: true,
    };

    it('should update a todo successfully', async () => {
      const updatedTodo = { ...mockTodo, ...validUpdate };
      vi.mocked(mockTodoRepository.updateTodo).mockResolvedValue(updatedTodo);

      const result = await todoBusinessLogic.updateTodo('user123', '1', validUpdate);

      expect(mockTodoRepository.updateTodo).toHaveBeenCalledWith('user123', '1', validUpdate);
      expect(result).toEqual(updatedTodo);
    });

    it('should throw error for empty title', async () => {
      const invalidUpdate = { title: '  ' };
      
      await expect(todoBusinessLogic.updateTodo('user123', '1', invalidUpdate))
        .rejects.toThrow('Title cannot be empty');
    });

    it('should throw error for empty description', async () => {
      const invalidUpdate = { description: '  ' };
      
      await expect(todoBusinessLogic.updateTodo('user123', '1', invalidUpdate))
        .rejects.toThrow('Description cannot be empty');
    });

    it('should throw error for invalid dueDate format', async () => {
      const invalidUpdate = { dueDate: 'invalid-date' };
      
      await expect(todoBusinessLogic.updateTodo('user123', '1', invalidUpdate))
        .rejects.toThrow('Invalid due date format');
    });

    it('should throw error for invalid priority', async () => {
      const invalidUpdate = { priority: 5 as any };
      
      await expect(todoBusinessLogic.updateTodo('user123', '1', invalidUpdate))
        .rejects.toThrow('Priority must be 1, 2, or 3');
    });

    it('should allow undefined values in update', async () => {
      const partialUpdate = { title: 'New Title' };
      vi.mocked(mockTodoRepository.updateTodo).mockResolvedValue(mockTodo);

      await expect(todoBusinessLogic.updateTodo('user123', '1', partialUpdate))
        .resolves.not.toThrow();
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo successfully', async () => {
      vi.mocked(mockTodoRepository.deleteTodo).mockResolvedValue(true);

      const result = await todoBusinessLogic.deleteTodo('user123', '1');

      expect(mockTodoRepository.deleteTodo).toHaveBeenCalledWith('user123', '1');
      expect(result).toBe(true);
    });

    it('should return false for non-existent todo', async () => {
      vi.mocked(mockTodoRepository.deleteTodo).mockResolvedValue(false);

      const result = await todoBusinessLogic.deleteTodo('user123', '999');

      expect(result).toBe(false);
    });

    it('should throw error for empty id', async () => {
      await expect(todoBusinessLogic.deleteTodo('user123', ''))
        .rejects.toThrow('ID is required');
    });
  });

  describe('toggleTodoCompletion', () => {
    it('should toggle todo completion successfully', async () => {
      vi.mocked(mockTodoRepository.getTodoById).mockResolvedValue(mockTodo);
      const toggledTodo = { ...mockTodo, completed: true };
      vi.mocked(mockTodoRepository.updateTodo).mockResolvedValue(toggledTodo);

      const result = await todoBusinessLogic.toggleTodoCompletion('user123', '1');

      expect(mockTodoRepository.getTodoById).toHaveBeenCalledWith('user123', '1');
      expect(mockTodoRepository.updateTodo).toHaveBeenCalledWith('user123', '1', { completed: true });
      expect(result).toEqual(toggledTodo);
    });

    it('should return null for non-existent todo', async () => {
      vi.mocked(mockTodoRepository.getTodoById).mockResolvedValue(null);

      const result = await todoBusinessLogic.toggleTodoCompletion('user123', '999');

      expect(result).toBeNull();
      expect(mockTodoRepository.updateTodo).not.toHaveBeenCalled();
    });
  });
});