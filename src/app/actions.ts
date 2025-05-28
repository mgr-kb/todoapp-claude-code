'use server';

import { auth } from '@clerk/nextjs/server';
import { TodoServiceFacade } from '@/lib/services/TodoServiceFacade';
import { TodoCreateInput, TodoUpdateInput } from '@/types/todo';
import { revalidatePath } from 'next/cache';

export async function createTodoAction(formData: FormData) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dueDate = formData.get('dueDate') as string;
  const priority = parseInt(formData.get('priority') as string) as 1 | 2 | 3;

  if (!title || !description || !dueDate || !priority) {
    throw new Error('All fields are required');
  }

  const todoData: TodoCreateInput = {
    title,
    description,
    dueDate,
    priority,
  };

  try {
    const todoService = new TodoServiceFacade();
    await todoService.createUserIfNotExists(userId);
    await todoService.createTodo(userId, todoData);
    revalidatePath('/');
  } catch (error) {
    console.error('Error creating todo:', error);
    throw new Error('Failed to create todo');
  }
}

export async function updateTodoAction(id: string, formData: FormData) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dueDate = formData.get('dueDate') as string;
  const priority = formData.get('priority') as string;
  const completed = formData.get('completed') === 'true';

  const updateData: TodoUpdateInput = {};
  
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (dueDate) updateData.dueDate = dueDate;
  if (priority) updateData.priority = parseInt(priority) as 1 | 2 | 3;
  if (formData.has('completed')) updateData.completed = completed;

  try {
    const todoService = new TodoServiceFacade();
    const result = await todoService.updateTodo(userId, id, updateData);
    if (!result) {
      throw new Error('Todo not found');
    }
    revalidatePath('/');
  } catch (error) {
    console.error('Error updating todo:', error);
    throw new Error('Failed to update todo');
  }
}

export async function deleteTodoAction(id: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  try {
    const todoService = new TodoServiceFacade();
    const result = await todoService.deleteTodo(userId, id);
    if (!result) {
      throw new Error('Todo not found');
    }
    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw new Error('Failed to delete todo');
  }
}

export async function toggleTodoAction(id: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  try {
    const todoService = new TodoServiceFacade();
    const result = await todoService.toggleTodoCompletion(userId, id);
    if (!result) {
      throw new Error('Todo not found');
    }
    revalidatePath('/');
  } catch (error) {
    console.error('Error toggling todo:', error);
    throw new Error('Failed to toggle todo');
  }
}