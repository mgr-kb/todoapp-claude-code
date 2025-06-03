'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Plus } from 'lucide-react';
import { Todo } from '@/types/todo';
import { getTodosAction } from '@/app/actions';
import { TodoCreateForm } from './TodoCreateForm';
import { useTodoMutations } from './hooks/useTodoMutations';
import useSWR from 'swr';

interface TodoListProps {
  initialTodos: Todo[];
}

export function TodoList({ initialTodos }: TodoListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: todos = initialTodos, mutate } = useSWR<Todo[]>(
    '/todos',
    () => getTodosAction(),
    {
      fallbackData: initialTodos,
      revalidateOnFocus: false,
    }
  );

  const { handleToggle, handleDelete, isPending } = useTodoMutations({
    todos,
    mutate,
  });

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge variant="destructive">高</Badge>;
      case 2:
        return <Badge variant="secondary">中</Badge>;
      case 3:
        return <Badge variant="outline">低</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">TODOリスト</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新しいTODO
        </Button>
      </div>
      
      <div className="space-y-4">
        {todos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">TODOがありません。新しいTODOを作成してください。</p>
            </CardContent>
          </Card>
        ) : (
          todos.map((todo) => (
            <Card key={todo.id} className={todo.completed ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => handleToggle(todo)}
                      disabled={isPending}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <CardTitle className={`text-lg ${todo.completed ? 'line-through' : ''}`}>
                        <label htmlFor={`todo-${todo.id}`} className="cursor-pointer">
                          {todo.title}
                        </label>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {todo.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(todo.priority)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(todo.id)}
                      disabled={isPending}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  期日: {formatDate(todo.dueDate)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <TodoCreateForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => mutate()}
      />
    </>
  );
}