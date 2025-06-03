'use client';

import { useTransition } from 'react';
import { Todo } from '@/types/todo';
import { toggleTodoAction, deleteTodoAction } from '@/app/actions';
import { KeyedMutator } from 'swr';

interface UseTodoMutationsProps {
  todos: Todo[];
  mutate: KeyedMutator<Todo[]>;
}

interface TodoMutationHandlers {
  handleToggle: (todo: Todo) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  isPending: boolean;
}

export function useTodoMutations({ todos, mutate }: UseTodoMutationsProps): TodoMutationHandlers {
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (todo: Todo) => {
    // Optimistic update
    const optimisticTodos = todos.map(t => 
      t.id === todo.id ? { ...t, completed: !t.completed } : t
    );
    
    await mutate(optimisticTodos, false);
    
    startTransition(async () => {
      const result = await toggleTodoAction(todo.id);
      if (result.status === 'success') {
        mutate();
      }
    });
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    const optimisticTodos = todos.filter(t => t.id !== id);
    
    await mutate(optimisticTodos, false);
    
    startTransition(async () => {
      const result = await deleteTodoAction(id);
      if (result.status === 'success') {
        mutate();
      }
    });
  };

  return {
    handleToggle,
    handleDelete,
    isPending,
  };
}