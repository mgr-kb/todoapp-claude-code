"use client";

import { useTransition } from "react";
import { Todo } from "@/types/todo";
import { toggleTodoAction, deleteTodoAction } from "@/app/actions";
import { KeyedMutator } from "swr";

interface UseTodoMutationsProps {
  todos: Todo[];
  mutate: KeyedMutator<Todo[]>;
}

interface TodoMutationHandlers {
  handleToggle: (todo: Todo) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  isPending: boolean;
}

export function useTodoMutations({
  todos,
  mutate,
}: UseTodoMutationsProps): TodoMutationHandlers {
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (todo: Todo) => {
    // Optimistic update
    const optimisticTodos = todos.map((t) =>
      t.id === todo.id ? { ...t, completed: !t.completed } : t
    );

    await mutate(optimisticTodos, false);

    startTransition(() => {
      toggleTodoAction(todo.id)
        .then((result) => {
          if (result.status === "success") {
            mutate();
          } else {
            // Rollback optimistic update on failure
            mutate();
            // Consider adding user notification for the error
            console.error("Failed to toggle todo:", result.error);
          }
        })
        .catch((error) => {
          // Rollback on network/unexpected errors
          mutate();
          console.error("Error toggling todo:", error);
        });
    });
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    const optimisticTodos = todos.filter((t) => t.id !== id);

    await mutate(optimisticTodos, false);

    startTransition(() => {
      deleteTodoAction(id)
        .then((result) => {
          if (result.status === "success") {
            mutate();
          } else {
            // Rollback optimistic update on failure
            mutate();
            console.error("Failed to delete todo:", result.error);
          }
        })
        .catch((error) => {
          // Rollback on network/unexpected errors
          mutate();
          console.error("Error deleting todo:", error);
        });
    });
  };

  return {
    handleToggle,
    handleDelete,
    isPending,
  };
}
