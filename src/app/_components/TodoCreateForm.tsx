'use client';

import { useForm, getInputProps, getTextareaProps } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createTodoAction } from '@/app/actions';
import { todoCreateSchema } from '@/lib/schemas/todoCreateSchema';
import { useRef, useState, useTransition } from 'react';

interface TodoCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TodoCreateForm({ 
  open, 
  onOpenChange, 
  onSuccess 
}: TodoCreateFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: todoCreateSchema });
    },
    // shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  // デフォルトの期日を明日に設定
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDueDate = tomorrow.toISOString().split('T')[0];

  const handleClose = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const submission = parseWithZod(formData, { schema: todoCreateSchema });
    
    if (submission.status !== 'success') {
      return;
    }
    
    startTransition(async () => {
      const result = await createTodoAction(null, formData);
      
      if (result.status === 'success') {
        if (formRef.current) {
          formRef.current.reset();
        }
        setError(null);
        onOpenChange(false);
        onSuccess?.();
      } else if (result.status === 'error' && result.error?.form) {
        setError(result.error.form[0]);
      }
    });
  };

  const priorityOptions = [
    { value: '1', label: '高' },
    { value: '2', label: '中' },
    { value: '3', label: '低' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいTODOを追加</DialogTitle>
          <DialogDescription>
            新しいタスクの詳細を入力してください。
          </DialogDescription>
        </DialogHeader>
        
        <form ref={formRef} id={form.id} onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={fields.title.id}>タイトル</Label>
            <Input
              {...getInputProps(fields.title, { type: 'text' })}
              placeholder="タスクのタイトルを入力"
              required
            />
            {fields.title.errors && (
              <div className="text-sm text-red-600">
                {fields.title.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={fields.description.id}>説明</Label>
            <Textarea
              {...getTextareaProps(fields.description)}
              placeholder="タスクの詳細説明を入力"
              required
            />
            {fields.description.errors && (
              <div className="text-sm text-red-600">
                {fields.description.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={fields.dueDate.id}>期日</Label>
            <Input
              {...getInputProps(fields.dueDate, { type: 'date' })}
              defaultValue={defaultDueDate}
              required
            />
            {fields.dueDate.errors && (
              <div className="text-sm text-red-600">
                {fields.dueDate.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={fields.priority.id}>優先度</Label>
            <Select
              name={fields.priority.name}
              defaultValue="2"
            >
              <SelectTrigger>
                <SelectValue placeholder="優先度を選択" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fields.priority.errors && (
              <div className="text-sm text-red-600">
                {fields.priority.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '作成中...' : 'TODOを作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}