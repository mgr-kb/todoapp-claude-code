import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  createTodoAction, 
  updateTodoAction, 
  deleteTodoAction, 
  toggleTodoAction, 
  getTodosAction 
} from './actions';
import { TodoServiceFacade } from '@/lib/services/TodoServiceFacade';
import { revalidatePath } from 'next/cache';

// Mock dependencies
const mockAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/services/TodoServiceFacade');

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('actions', () => {
  const mockTodoServiceFacade = {
    createUserIfNotExists: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    toggleTodoCompletion: vi.fn(),
    getTodos: vi.fn(),
  };

  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup TodoServiceFacade mock
    vi.mocked(TodoServiceFacade).mockImplementation(() => mockTodoServiceFacade as unknown as TodoServiceFacade);
    // Mock console.error to suppress error output in tests
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  describe('createTodoAction', () => {
    it('should create a todo successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user123' });
      const mockTodo = {
        id: '1',
        title: 'Test Todo',
        description: 'Test Description',
        dueDate: '2024-12-31',
        priority: 2,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTodoServiceFacade.createTodo.mockResolvedValue(mockTodo);

      const formData = new FormData();
      formData.append('title', 'Test Todo');
      formData.append('description', 'Test Description');
      formData.append('dueDate', '2024-12-31');
      formData.append('priority', '2');

      const result = await createTodoAction(null, formData);

      expect(result).toEqual({
        status: 'success',
        data: mockTodo,
      });
      expect(mockTodoServiceFacade.createUserIfNotExists).toHaveBeenCalledWith('user123');
      expect(mockTodoServiceFacade.createTodo).toHaveBeenCalledWith('user123', {
        title: 'Test Todo',
        description: 'Test Description',
        dueDate: '2024-12-31',
        priority: 2,
      });
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('should return error when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const formData = new FormData();
      formData.append('title', 'Test Todo');
      formData.append('description', 'Test Description');
      formData.append('dueDate', '2024-12-31');
      formData.append('priority', '2');

      const result = await createTodoAction(null, formData);

      expect(result).toEqual({
        status: 'error',
        error: { form: ['Unauthorized: User not authenticated'] },
      });
      expect(mockTodoServiceFacade.createTodo).not.toHaveBeenCalled();
    });

    it('should return validation error for invalid data', async () => {
      mockAuth.mockResolvedValue({ userId: 'user123' });

      const formData = new FormData();
      // Missing required fields

      const result = await createTodoAction(null, formData);

      expect(result.status).toBe('validation-error');
      if (result.status === 'validation-error') {
        expect(result.error).toBeDefined();
      }
      expect(mockTodoServiceFacade.createTodo).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user123' });
      mockTodoServiceFacade.createTodo.mockRejectedValue(new Error('Service error'));

      const formData = new FormData();
      formData.append('title', 'Test Todo');
      formData.append('description', 'Test Description');
      formData.append('dueDate', '2024-12-31');
      formData.append('priority', '2');

      const result = await createTodoAction(null, formData);

      expect(result).toEqual({
        status: 'error',
        error: { form: ['Failed to create todo'] },
      });
    });
  });

  describe('updateTodoAction', () => {
    it('should update a todo successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user123' });
      mockTodoServiceFacade.updateTodo.mockResolvedValue(true);

      const formData = new FormData();
      formData.append('title', 'Updated Todo');
      formData.append('description', 'Updated Description');
      formData.append('dueDate', '2024-12-25');
      formData.append('priority', '1');
      formData.append('completed', 'true');

      await updateTodoAction('1', formData);

      expect(mockTodoServiceFacade.updateTodo).toHaveBeenCalledWith('user123', '1', {
        title: 'Updated Todo',
        description: 'Updated Description',
        dueDate: '2024-12-25',
        priority: 1,
        completed: true,
      });
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('should throw error when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const formData = new FormData();
      formData.append('title', 'Updated Todo');

      await expect(updateTodoAction('1', formData)).rejects.toThrow('Unauthorized: User not authenticated');
    });

    it('should throw error when todo is not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user123' });
      mockTodoServiceFacade.updateTodo.mockResolvedValue(null);

      const formData = new FormData();
      formData.append('title', 'Updated Todo');

      await expect(updateTodoAction('1', formData)).rejects.toThrow('Failed to update todo');
    });
  });

  describe('deleteTodoAction', () => {
    it('should delete a todo successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user123' });
      mockTodoServiceFacade.deleteTodo.mockResolvedValue(true);

      const result = await deleteTodoAction('1');

      expect(result).toEqual({ status: 'success' });
      expect(mockTodoServiceFacade.deleteTodo).toHaveBeenCalledWith('user123', '1');
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('should return error when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await deleteTodoAction('1');

      expect(result).toEqual({
        status: 'error',
        error: { form: ['Unauthorized: User not authenticated'] },
      });
    });

    it('should return error when todo is not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user123' });
      mockTodoServiceFacade.deleteTodo.mockResolvedValue(false);

      const result = await deleteTodoAction('1');

      expect(result).toEqual({
        status: 'error',
        error: { form: ['Todo not found'] },
      });
    });
  });

  describe('toggleTodoAction', () => {
    it('should toggle a todo successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user123' });
      mockTodoServiceFacade.toggleTodoCompletion.mockResolvedValue(true);

      const result = await toggleTodoAction('1');

      expect(result).toEqual({ status: 'success' });
      expect(mockTodoServiceFacade.toggleTodoCompletion).toHaveBeenCalledWith('user123', '1');
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('should return error when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await toggleTodoAction('1');

      expect(result).toEqual({
        status: 'error',
        error: { form: ['Unauthorized: User not authenticated'] },
      });
    });

    it('should return error when todo is not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user123' });
      mockTodoServiceFacade.toggleTodoCompletion.mockResolvedValue(false);

      const result = await toggleTodoAction('1');

      expect(result).toEqual({
        status: 'error',
        error: { form: ['Todo not found'] },
      });
    });
  });

  describe('getTodosAction', () => {
    it('should get todos successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user123' });
      const mockTodos = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          dueDate: '2024-12-31',
          priority: 2,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockTodoServiceFacade.getTodos.mockResolvedValue({
        todos: mockTodos,
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
      });

      const result = await getTodosAction();

      expect(result).toEqual(mockTodos);
      expect(mockTodoServiceFacade.createUserIfNotExists).toHaveBeenCalledWith('user123');
      expect(mockTodoServiceFacade.getTodos).toHaveBeenCalledWith(
        'user123',
        { sortBy: 'dueDate', sortOrder: 'asc' },
        { page: 1, limit: 10 }
      );
    });

    it('should return empty array when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getTodosAction();

      expect(result).toEqual([]);
      expect(mockTodoServiceFacade.getTodos).not.toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      mockAuth.mockResolvedValue({ userId: 'user123' });
      mockTodoServiceFacade.getTodos.mockRejectedValue(new Error('Service error'));

      const result = await getTodosAction();

      expect(result).toEqual([]);
    });
  });
});