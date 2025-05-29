import { z } from 'zod';
import { TodoPriority } from '@/types/todo';

// フォーム用スキーマ（文字列から数値に変換）
export const todoCreateSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以下にしてください'),
  description: z.string().min(1, '説明は必須です').max(500, '説明は500文字以下にしてください'),
  dueDate: z.string().min(1, '期日は必須です').regex(/^\d{4}-\d{2}-\d{2}$/, '有効な日付を入力してください'),
  priority: z.string().transform((val) => parseInt(val)).pipe(z.number().int().min(1).max(3) as z.ZodType<TodoPriority>),
});

// 型定義
export type TodoCreateFormData = z.infer<typeof todoCreateSchema>;