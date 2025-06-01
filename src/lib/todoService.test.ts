import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TodoService } from './todoService';
import { prisma } from './prisma';
import { TodoCreateInput, TodoUpdateInput } from '@/types/todo';

// Mock prisma
vi.mock('./prisma', () => ({
  prisma: {
    todo: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      upsert: vi.fn(),
    },
  },
}));

// Mock mockData
vi.mock('./mockData', () => ({
  mockTodos: [
    {
      id: 'mock-1',
      title: 'Mock Todo 1',
      description: 'Mock Description 1',
      dueDate: '2024-12-31',
      priority: 1,
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'mock-2',
      title: 'Mock Todo 2',
      description: 'Mock Description 2',
      dueDate: '2024-12-25',
      priority: 2,
      completed: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ],
}));

describe('TodoService', () => {
  const mockUserId = 'user123';
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createTodo', () => {
    const todoInput: TodoCreateInput = {
      title: 'Test Todo',
      description: 'Test Description',
      dueDate: '2024-12-31',
      priority: 2,
    };

    it('should create a todo with database', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'database';
      const mockCreatedTodo = {
        id: '1',
        title: todoInput.title,
        description: todoInput.description,
        dueDate: new Date(todoInput.dueDate),
        priority: todoInput.priority,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: mockUserId,
      };
      
      vi.mocked(prisma.todo.create).mockResolvedValue(mockCreatedTodo);

      const result = await TodoService.createTodo(mockUserId, todoInput);

      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: {
          ...todoInput,
          dueDate: new Date(todoInput.dueDate),
          userId: mockUserId,
        },
      });
      expect(result).toEqual({
        id: mockCreatedTodo.id,
        title: mockCreatedTodo.title,
        description: mockCreatedTodo.description,
        dueDate: '2024-12-31',
        priority: mockCreatedTodo.priority,
        completed: mockCreatedTodo.completed,
        createdAt: mockCreatedTodo.createdAt,
        updatedAt: mockCreatedTodo.updatedAt,
      });
    });

    it('should create a todo with mock data', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'mock';

      const result = await TodoService.createTodo(mockUserId, todoInput);

      expect(result).toMatchObject({
        ...todoInput,
        completed: false,
      });
      expect(result.id).toBeDefined();
      expect(prisma.todo.create).not.toHaveBeenCalled();
    });
  });

  describe('getTodos', () => {
    it('should get todos with database', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'database';
      const mockTodos = [
        {
          id: '1',
          title: 'Todo 1',
          description: 'Description 1',
          dueDate: new Date('2024-12-31'),
          priority: 1,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: mockUserId,
        },
      ];

      vi.mocked(prisma.todo.findMany).mockResolvedValue(mockTodos);
      vi.mocked(prisma.todo.count).mockResolvedValue(1);

      const result = await TodoService.getTodos(mockUserId);

      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: [
          { dueDate: 'asc' },
          { priority: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        todos: [{
          id: mockTodos[0].id,
          title: mockTodos[0].title,
          description: mockTodos[0].description,
          dueDate: '2024-12-31',
          priority: mockTodos[0].priority,
          completed: mockTodos[0].completed,
          createdAt: mockTodos[0].createdAt,
          updatedAt: mockTodos[0].updatedAt,
        }],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    it('should get todos with mock data', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'mock';

      const result = await TodoService.getTodos(mockUserId);

      expect(result.todos.length).toBeGreaterThan(0);
      expect(result.totalCount).toBeGreaterThan(0);
      expect(prisma.todo.findMany).not.toHaveBeenCalled();
    });

    it('should sort todos correctly', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'mock';

      const result = await TodoService.getTodos(
        mockUserId,
        { sortBy: 'priority', sortOrder: 'asc' }
      );

      expect(result.todos[0].priority).toBe(1);
      expect(result.todos[1].priority).toBe(2);
    });

    it('should paginate todos correctly', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'mock';

      const result = await TodoService.getTodos(
        mockUserId,
        { sortBy: 'dueDate', sortOrder: 'asc' },
        { page: 1, limit: 1 }
      );

      expect(result.todos).toHaveLength(1);
      expect(result.totalPages).toBeGreaterThanOrEqual(2);
      expect(result.currentPage).toBe(1);
    });
  });

  describe('getTodoById', () => {
    it('should get a todo by id with database', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'database';
      const mockTodo = {
        id: '1',
        title: 'Todo 1',
        description: 'Description 1',
        dueDate: new Date('2024-12-31'),
        priority: 1,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: mockUserId,
      };

      vi.mocked(prisma.todo.findFirst).mockResolvedValue(mockTodo);

      const result = await TodoService.getTodoById(mockUserId, '1');

      expect(prisma.todo.findFirst).toHaveBeenCalledWith({
        where: { id: '1', userId: mockUserId },
      });
      expect(result).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        dueDate: '2024-12-31',
        priority: mockTodo.priority,
        completed: mockTodo.completed,
        createdAt: mockTodo.createdAt,
        updatedAt: mockTodo.updatedAt,
      });
    });

    it('should get a todo by id with mock data', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'mock';

      const result = await TodoService.getTodoById(mockUserId, 'mock-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('mock-1');
      expect(prisma.todo.findFirst).not.toHaveBeenCalled();
    });

    it('should return null for non-existent todo', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'database';
      vi.mocked(prisma.todo.findFirst).mockResolvedValue(null);

      const result = await TodoService.getTodoById(mockUserId, 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateTodo', () => {
    const updateData: TodoUpdateInput = {
      title: 'Updated Title',
      completed: true,
    };

    it('should update a todo with database', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'database';
      vi.mocked(prisma.todo.updateMany).mockResolvedValue({ count: 1 });
      const updatedTodo = {
        id: '1',
        title: 'Updated Title',
        description: 'Description',
        dueDate: new Date('2024-12-31'),
        priority: 1,
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: mockUserId,
      };
      vi.mocked(prisma.todo.findFirst).mockResolvedValue(updatedTodo);

      const result = await TodoService.updateTodo(mockUserId, '1', updateData);

      expect(prisma.todo.updateMany).toHaveBeenCalledWith({
        where: { id: '1', userId: mockUserId },
        data: updateData,
      });
      expect(result).toEqual({
        id: updatedTodo.id,
        title: updatedTodo.title,
        description: updatedTodo.description,
        dueDate: '2024-12-31',
        priority: updatedTodo.priority,
        completed: updatedTodo.completed,
        createdAt: updatedTodo.createdAt,
        updatedAt: updatedTodo.updatedAt,
      });
    });

    it('should update a todo with mock data', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'mock';

      const result = await TodoService.updateTodo(mockUserId, 'mock-1', updateData);

      expect(result).toBeDefined();
      expect(result?.title).toBe('Updated Title');
      expect(result?.completed).toBe(true);
      expect(prisma.todo.updateMany).not.toHaveBeenCalled();
    });

    it('should return null for non-existent todo', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'database';
      vi.mocked(prisma.todo.updateMany).mockResolvedValue({ count: 0 });

      const result = await TodoService.updateTodo(mockUserId, 'non-existent', updateData);

      expect(result).toBeNull();
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo with database', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'database';
      vi.mocked(prisma.todo.deleteMany).mockResolvedValue({ count: 1 });

      const result = await TodoService.deleteTodo(mockUserId, '1');

      expect(prisma.todo.deleteMany).toHaveBeenCalledWith({
        where: { id: '1', userId: mockUserId },
      });
      expect(result).toBe(true);
    });

    it('should delete a todo with mock data', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'mock';

      const result = await TodoService.deleteTodo(mockUserId, 'mock-1');

      expect(result).toBe(true);
      expect(prisma.todo.deleteMany).not.toHaveBeenCalled();
    });

    it('should return false for non-existent todo', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'database';
      vi.mocked(prisma.todo.deleteMany).mockResolvedValue({ count: 0 });

      const result = await TodoService.deleteTodo(mockUserId, 'non-existent');

      expect(result).toBe(false);
    });
  });

  describe('createUserIfNotExists', () => {
    it('should create user if not exists with database', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'database';

      await TodoService.createUserIfNotExists(mockUserId);

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { id: mockUserId },
        update: {},
        create: { id: mockUserId },
      });
    });

    it('should not create user with mock data', async () => {
      process.env.NEXT_PUBLIC_DATA_SOURCE = 'mock';

      await TodoService.createUserIfNotExists(mockUserId);

      expect(prisma.user.upsert).not.toHaveBeenCalled();
    });
  });
});