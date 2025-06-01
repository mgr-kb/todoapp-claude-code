import { auth } from '@clerk/nextjs/server';
import { TodoServiceFacade } from '@/lib/services/TodoServiceFacade';
import { TodoSortOptions, PaginationOptions, Todo } from '@/types/todo';

export async function fetchTodos(
  sortOptions: TodoSortOptions = { sortBy: 'dueDate', sortOrder: 'asc' },
  paginationOptions: PaginationOptions = { page: 1, limit: 10 }
): Promise<Todo[]> {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  try {
    const todoService = new TodoServiceFacade();
    await todoService.createUserIfNotExists(userId);
    const result = await todoService.getTodos(userId, sortOptions, paginationOptions);
    return result.todos;
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
}