import { prisma } from '@/lib/prisma';
import { Todo, TodoCreateInput, TodoUpdateInput, PaginatedTodos, TodoSortOptions, PaginationOptions } from '@/types/todo';
import { ITodoRepository } from './interfaces/ITodoRepository';

export class DatabaseTodoRepository implements ITodoRepository {
  async createTodo(userId: string, data: TodoCreateInput): Promise<Todo> {
    const todo = await prisma.todo.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
        userId,
      },
    });

    return this.transformPrismaToTodo(todo);
  }

  async getTodos(
    userId: string,
    sortOptions: TodoSortOptions,
    paginationOptions: PaginationOptions
  ): Promise<PaginatedTodos> {
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

  async getTodoById(userId: string, id: string): Promise<Todo | null> {
    const todo = await prisma.todo.findFirst({
      where: { id, userId },
    });

    return todo ? this.transformPrismaToTodo(todo) : null;
  }

  async updateTodo(userId: string, id: string, data: TodoUpdateInput): Promise<Todo | null> {
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

  async deleteTodo(userId: string, id: string): Promise<boolean> {
    const result = await prisma.todo.deleteMany({
      where: { id, userId },
    });

    return result.count > 0;
  }

  private transformPrismaToTodo(prismaData: { id: string; title: string; description: string; dueDate: Date; priority: number; completed: boolean; createdAt: Date; updatedAt: Date }): Todo {
    return {
      id: prismaData.id,
      title: prismaData.title,
      description: prismaData.description,
      dueDate: prismaData.dueDate.toISOString().split('T')[0],
      priority: prismaData.priority as 1 | 2 | 3,
      completed: prismaData.completed,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
    };
  }

  private buildOrderBy(sortBy: string, sortOrder: string) {
    const orderByMap: Record<string, Array<{ [key: string]: 'asc' | 'desc' }>> = {
      dueDate: [{ dueDate: sortOrder as 'asc' | 'desc' }, { priority: 'asc' }, { createdAt: 'desc' }],
      priority: [{ priority: sortOrder as 'asc' | 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      createdAt: [{ createdAt: sortOrder as 'asc' | 'desc' }, { dueDate: 'asc' }, { priority: 'asc' }],
    };

    return orderByMap[sortBy] || orderByMap.dueDate;
  }
}