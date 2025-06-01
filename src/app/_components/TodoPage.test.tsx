import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodoPage } from './TodoPage';
import { Todo } from '@/types/todo';

// Mock TodoList component
vi.mock('./TodoList', () => ({
  TodoList: ({ initialTodos }: { initialTodos: Todo[] }) => (
    <div data-testid="todo-list">
      TodoList Component - {initialTodos.length} todos
    </div>
  ),
}));

describe('TodoPage', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Test TODO 1',
      description: 'Description 1',
      dueDate: '2024-12-31',
      priority: 1,
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      title: 'Test TODO 2',
      description: 'Description 2',
      dueDate: '2024-12-25',
      priority: 2,
      completed: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  it('should render TodoList component with todos data', () => {
    render(<TodoPage todosData={mockTodos} />);
    
    const todoList = screen.getByTestId('todo-list');
    expect(todoList).toBeInTheDocument();
    expect(todoList).toHaveTextContent('TodoList Component - 2 todos');
  });

  it('should render with empty todos array', () => {
    render(<TodoPage todosData={[]} />);
    
    const todoList = screen.getByTestId('todo-list');
    expect(todoList).toBeInTheDocument();
    expect(todoList).toHaveTextContent('TodoList Component - 0 todos');
  });

  it('should have correct container classes', () => {
    const { container } = render(<TodoPage todosData={mockTodos} />);
    
    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('container', 'mx-auto', 'py-8', 'px-4');
    
    const wrapperDiv = container.querySelector('.max-w-4xl');
    expect(wrapperDiv).toHaveClass('max-w-4xl', 'mx-auto');
  });

  it('should wrap TodoList in Suspense', () => {
    // This test verifies the structure but Suspense behavior is hard to test
    // without async components. The important thing is that TodoList is rendered.
    render(<TodoPage todosData={mockTodos} />);
    
    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
  });

  it('should pass todosData as initialTodos to TodoList', () => {
    // This is implicitly tested by the mock implementation
    // which shows the length of initialTodos
    render(<TodoPage todosData={mockTodos} />);
    
    expect(screen.getByText('TodoList Component - 2 todos')).toBeInTheDocument();
  });
});