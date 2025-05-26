import { TodoPage } from '@/components/TodoPage';
import { mockTodos } from '@/lib/mockData';

export default function Home() {
  return <TodoPage initialTodos={mockTodos} />;
}
