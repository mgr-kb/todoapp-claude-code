import { AuthWrapper } from '@/components/AuthWrapper';
import { TodoPage } from '@/components/TodoPage';
import { mockTodos } from '@/lib/mockData';

export default function Home() {
  return (
    <AuthWrapper>
      <TodoPage initialTodos={mockTodos} />
    </AuthWrapper>
  );
}
