import { prisma } from './prisma';
import { mockTodos } from './mockData';
import { Todo, TodoCreateInput, TodoUpdateInput, PaginatedTodos, TodoSortOptions, PaginationOptions } from '@/types/todo';

function isUsingMockData(): boolean {
  return process.env.NEXT_PUBLIC_DATA_SOURCE === 'mock';
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function sortTodos(todos: Todo[], sortOptions: TodoSortOptions): Todo[] {
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

function paginateTodos(todos: Todo[], paginationOptions: PaginationOptions): PaginatedTodos {
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

const mockTodosList: Todo[] = [...mockTodos];

export class TodoService {
  static async createTodo(userId: string, data: TodoCreateInput): Promise<Todo> {
    if (isUsingMockData()) {
      const newTodo: Todo = {
        id: generateId(),
        ...data,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTodosList.push(newTodo);
      return newTodo;
    }

    const todo = await prisma.todo.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
        userId,
      },
    });

    return this.transformPrismaToTodo(todo);
  }

  static async getTodos(
    userId: string,
    sortOptions: TodoSortOptions = { sortBy: 'dueDate', sortOrder: 'asc' },
    paginationOptions: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedTodos> {
    if (isUsingMockData()) {
      const sortedTodos = sortTodos(mockTodosList, sortOptions);
      return paginateTodos(sortedTodos, paginationOptions);
    }

    const { sortBy, sortOrder } = sortOptions;
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [todos, totalCount] = await Promise.all([
      prisma.todo.findMany({
        where: { userId },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.todo.count({
        where: { userId },
      }),
    ]);

    const transformedTodos = todos.map(this.transformPrismaToTodo);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      todos: transformedTodos,
      totalCount,
      totalPages,
      currentPage: page,
    };
  }

  static async getTodoById(userId: string, id: string): Promise<Todo | null> {
    if (isUsingMockData()) {
      const todo = mockTodosList.find(t => t.id === id);
      return todo || null;
    }

    const todo = await prisma.todo.findFirst({
      where: { id, userId },
    });

    return todo ? this.transformPrismaToTodo(todo) : null;
  }

  static async updateTodo(userId: string, id: string, data: TodoUpdateInput): Promise<Todo | null> {
    if (isUsingMockData()) {
      const todoIndex = mockTodosList.findIndex(t => t.id === id);
      if (todoIndex === -1) {
        return null;
      }
      
      mockTodosList[todoIndex] = {
        ...mockTodosList[todoIndex],
        ...data,
        updatedAt: new Date(),
      };
      
      return mockTodosList[todoIndex];
    }

    const updateData = { ...data } as { title?: string; description?: string; dueDate?: Date; priority?: number; completed?: boolean };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    const todo = await prisma.todo.updateMany({
      where: { id, userId },
      data: updateData,
    });

    if (todo.count === 0) {
      return null;
    }

    return this.getTodoById(userId, id);
  }

  static async deleteTodo(userId: string, id: string): Promise<boolean> {
    if (isUsingMockData()) {
      const todoIndex = mockTodosList.findIndex(t => t.id === id);
      if (todoIndex === -1) {
        return false;
      }
      
      mockTodosList.splice(todoIndex, 1);
      return true;
    }

    const result = await prisma.todo.deleteMany({
      where: { id, userId },
    });

    return result.count > 0;
  }

  static async createUserIfNotExists(userId: string): Promise<void> {
    if (isUsingMockData()) {
      // Mock data doesn't require user creation
      return;
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });
  }

  private static transformPrismaToTodo(prismaData: { id: string; title: string; description: string; dueDate: Date; priority: number; completed: boolean; createdAt: Date; updatedAt: Date }): Todo {
    return {
      id: prismaData.id,
      title: prismaData.title,
      description: prismaData.description,
      dueDate: prismaData.dueDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD
      priority: prismaData.priority as 1 | 2 | 3,
      completed: prismaData.completed,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
    };
  }

  private static buildOrderBy(sortBy: string, sortOrder: string) {
    const orderByMap: Record<string, Array<{ [key: string]: 'asc' | 'desc' }>> = {
      dueDate: [{ dueDate: sortOrder as 'asc' | 'desc' }, { priority: 'asc' }, { createdAt: 'desc' }],
      priority: [{ priority: sortOrder as 'asc' | 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      createdAt: [{ createdAt: sortOrder as 'asc' | 'desc' }, { dueDate: 'asc' }, { priority: 'asc' }],
    };

    return orderByMap[sortBy] || orderByMap.dueDate;
  }
}