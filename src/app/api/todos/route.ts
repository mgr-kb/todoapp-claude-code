import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TodoService } from '@/lib/todoService';
import type { SortBy, SortOrder, TodoCreateInput } from '@/types/todo';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await TodoService.createUserIfNotExists(userId);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'dueDate';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const result = await TodoService.getTodos(
      userId,
      { sortBy: sortBy as SortBy, sortOrder: sortOrder as SortOrder },
      { page, limit }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await TodoService.createUserIfNotExists(userId);

    const body = await request.json();
    const todoData: TodoCreateInput = {
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      priority: body.priority,
    };

    const todo = await TodoService.createTodo(userId, todoData);

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}