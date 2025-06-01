import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockTodoRepository } from './MockTodoRepository';
import { TodoCreateInput, TodoUpdateInput } from '@/types/todo';

// Mock the mockData module to have a fresh copy for each test
vi.mock('@/lib/mockData', () => ({
  mockTodos: []
}));

describe('MockTodoRepository', () => {
  let repository: MockTodoRepository;
  const mockUserId = 'user123';

  beforeEach(() => {
    // Reset mock data
    vi.resetModules();
    repository = new MockTodoRepository();
  });

  describe('createTodo', () => {
    it('should create a new todo', async () => {
      const input: TodoCreateInput = {
        title: 'New Todo',
        description: 'New Description',
        dueDate: '2024-12-31',
        priority: 2,
      };

      const result = await repository.createTodo(mockUserId, input);

      expect(result).toMatchObject({
        ...input,
        completed: false,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should add todo to the list', async () => {
      const initialTodos = await repository.getTodos(
        mockUserId,
        { sortBy: 'createdAt', sortOrder: 'asc' },
        { page: 1, limit: 100 }
      );
      const initialCount = initialTodos.totalCount;

      const input: TodoCreateInput = {
        title: 'New Todo',
        description: 'New Description',
        dueDate: '2024-12-31',
        priority: 2,
      };

      await repository.createTodo(mockUserId, input);

      const afterTodos = await repository.getTodos(
        mockUserId,
        { sortBy: 'createdAt', sortOrder: 'asc' },
        { page: 1, limit: 100 }
      );

      expect(afterTodos.totalCount).toBe(initialCount + 1);
    });
  });

  describe('getTodos', () => {
    beforeEach(async () => {
      // Add some test todos
      await repository.createTodo(mockUserId, {
        title: 'Todo 1',
        description: 'Description 1',
        dueDate: '2024-12-25',
        priority: 3,
      });
      await repository.createTodo(mockUserId, {
        title: 'Todo 2',
        description: 'Description 2',
        dueDate: '2024-12-20',
        priority: 1,
      });
      await repository.createTodo(mockUserId, {
        title: 'Todo 3',
        description: 'Description 3',
        dueDate: '2024-12-30',
        priority: 2,
      });
    });

    it('should get todos with pagination', async () => {
      const result = await repository.getTodos(
        mockUserId,
        { sortBy: 'createdAt', sortOrder: 'asc' },
        { page: 1, limit: 2 }
      );

      expect(result.todos).toHaveLength(2);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBeGreaterThanOrEqual(2);
    });

    it('should sort by due date ascending', async () => {
      const result = await repository.getTodos(
        mockUserId,
        { sortBy: 'dueDate', sortOrder: 'asc' },
        { page: 1, limit: 10 }
      );

      const dueDates = result.todos.map(t => new Date(t.dueDate).getTime());
      const sortedDueDates = [...dueDates].sort((a, b) => a - b);
      expect(dueDates).toEqual(sortedDueDates);
    });

    it('should sort by priority ascending', async () => {
      const result = await repository.getTodos(
        mockUserId,
        { sortBy: 'priority', sortOrder: 'asc' },
        { page: 1, limit: 10 }
      );

      const priorities = result.todos.map(t => t.priority);
      const sortedPriorities = [...priorities].sort((a, b) => a - b);
      expect(priorities).toEqual(sortedPriorities);
    });

    it('should sort by created date descending', async () => {
      const result = await repository.getTodos(
        mockUserId,
        { sortBy: 'createdAt', sortOrder: 'desc' },
        { page: 1, limit: 10 }
      );

      const createdDates = result.todos.map(t => new Date(t.createdAt).getTime());
      const sortedDates = [...createdDates].sort((a, b) => b - a);
      expect(createdDates).toEqual(sortedDates);
    });
  });

  describe('getTodoById', () => {
    it('should get todo by id', async () => {
      const created = await repository.createTodo(mockUserId, {
        title: 'Test Todo',
        description: 'Test Description',
        dueDate: '2024-12-31',
        priority: 2,
      });

      const result = await repository.getTodoById(mockUserId, created.id);

      expect(result).toEqual(created);
    });

    it('should return null for non-existent id', async () => {
      const result = await repository.getTodoById(mockUserId, 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateTodo', () => {
    it('should update existing todo', async () => {
      const created = await repository.createTodo(mockUserId, {
        title: 'Original Title',
        description: 'Original Description',
        dueDate: '2024-12-31',
        priority: 2,
      });

      const updateData: TodoUpdateInput = {
        title: 'Updated Title',
        completed: true,
      };

      const result = await repository.updateTodo(mockUserId, created.id, updateData);

      expect(result).toMatchObject({
        id: created.id,
        title: 'Updated Title',
        description: 'Original Description',
        completed: true,
      });
      expect(result!.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
    });

    it('should return null for non-existent todo', async () => {
      const result = await repository.updateTodo(mockUserId, 'non-existent', { title: 'Updated' });

      expect(result).toBeNull();
    });

    it('should update only provided fields', async () => {
      const created = await repository.createTodo(mockUserId, {
        title: 'Original Title',
        description: 'Original Description',
        dueDate: '2024-12-31',
        priority: 2,
      });

      const result = await repository.updateTodo(mockUserId, created.id, { priority: 1 });

      expect(result).toMatchObject({
        title: 'Original Title',
        description: 'Original Description',
        dueDate: '2024-12-31',
        priority: 1,
      });
    });
  });

  describe('deleteTodo', () => {
    it('should delete existing todo', async () => {
      const created = await repository.createTodo(mockUserId, {
        title: 'To Delete',
        description: 'Will be deleted',
        dueDate: '2024-12-31',
        priority: 2,
      });

      const result = await repository.deleteTodo(mockUserId, created.id);

      expect(result).toBe(true);

      const found = await repository.getTodoById(mockUserId, created.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent todo', async () => {
      const result = await repository.deleteTodo(mockUserId, 'non-existent');

      expect(result).toBe(false);
    });

    it('should remove todo from the list', async () => {
      const created = await repository.createTodo(mockUserId, {
        title: 'To Delete',
        description: 'Will be deleted',
        dueDate: '2024-12-31',
        priority: 2,
      });

      const beforeDelete = await repository.getTodos(
        mockUserId,
        { sortBy: 'createdAt', sortOrder: 'asc' },
        { page: 1, limit: 100 }
      );
      const countBefore = beforeDelete.totalCount;

      await repository.deleteTodo(mockUserId, created.id);

      const afterDelete = await repository.getTodos(
        mockUserId,
        { sortBy: 'createdAt', sortOrder: 'asc' },
        { page: 1, limit: 100 }
      );

      expect(afterDelete.totalCount).toBe(countBefore - 1);
    });
  });
});