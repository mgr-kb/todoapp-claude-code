import { auth } from '@clerk/nextjs/server';
import { TodoServiceFacade } from '@/lib/services/TodoServiceFacade';
import { TodoSortOptions, PaginationOptions, PaginatedTodos } from '@/types/todo';

export async function fetchTodos(
  sortOptions: TodoSortOptions = { sortBy: 'dueDate', sortOrder: 'asc' },
  paginationOptions: PaginationOptions = { page: 1, limit: 10 }
): Promise<PaginatedTodos> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  try {
    const todoService = new TodoServiceFacade();
    await todoService.createUserIfNotExists(userId);
    return await todoService.getTodos(userId, sortOptions, paginationOptions);
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw new Error('Failed to fetch todos');
  }
}