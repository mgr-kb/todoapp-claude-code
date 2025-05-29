'use client';

import { useState, startTransition } from 'react';
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
import { TodoCreateInput } from '@/types/todo';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  
  // デフォルトの期日を明日に設定
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDueDate = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState<TodoCreateInput>({
    title: '',
    description: '',
    dueDate: defaultDueDate,
    priority: 2,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const form = event.currentTarget;
    const formDataObj = new FormData(form);

    startTransition(async () => {
      try {
        const result = await createTodoAction(null, formDataObj);
        
        if (result.status === 'success') {
          // 成功時の処理
          setFormData({
            title: '',
            description: '',
            dueDate: defaultDueDate,
            priority: 2,
          });
          onOpenChange(false);
          onSuccess?.();
        } else if (result.status === 'validation-error' && result.error) {
          const validationErrors: Record<string, string[]> = {};
          for (const [key, value] of Object.entries(result.error || {})) {
            if (value) {
              validationErrors[key] = value;
            }
          }
          setErrors(validationErrors);
        } else if (result.status === 'error' && result.error) {
          setErrors(result.error);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors({ form: ['予期しないエラーが発生しました'] });
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: defaultDueDate,
      priority: 2,
    });
    setErrors({});
    onOpenChange(false);
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="タスクのタイトルを入力"
              required
            />
            {errors.title && (
              <div className="text-sm text-red-600">
                {errors.title?.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="タスクの詳細説明を入力"
              required
            />
            {errors.description && (
              <div className="text-sm text-red-600">
                {errors.description?.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">期日</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
            {errors.dueDate && (
              <div className="text-sm text-red-600">
                {errors.dueDate?.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">優先度</Label>
            <Select
              name="priority"
              value={formData.priority.toString()}
              onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) as 1 | 2 | 3 })}
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
            {errors.priority && (
              <div className="text-sm text-red-600">
                {errors.priority?.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>

          {errors.form && (
            <div className="text-sm text-red-600">
              {errors.form?.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '作成中...' : 'TODOを作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}