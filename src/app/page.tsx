import { AuthWrapper } from '@/components/AuthWrapper';
import { TodoPage } from './_components/TodoPage';
import { fetchTodos } from './fetcher';

export default async function Home() {
  const todosData = await fetchTodos();
  
  return (
    <AuthWrapper>
      <TodoPage todosData={todosData} />
    </AuthWrapper>
  );
}
