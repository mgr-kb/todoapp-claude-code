import { Suspense } from 'react';
import { TodoList } from './TodoList';
import { Todo } from '@/types/todo';
import { Loader2 } from 'lucide-react';

interface TodoPageProps {
  todosData: Todo[];
}

export function TodoPage({ todosData }: TodoPageProps) {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        }>
          <TodoList initialTodos={todosData} />
        </Suspense>
      </div>
    </main>
  );
}