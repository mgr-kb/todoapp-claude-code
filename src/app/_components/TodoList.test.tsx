/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoList } from './TodoList';
import { toggleTodoAction, deleteTodoAction } from '@/app/actions';
import { Todo } from '@/types/todo';

// Mock the actions module
vi.mock('@/app/actions', () => ({
  toggleTodoAction: vi.fn(),
  deleteTodoAction: vi.fn(),
  getTodosAction: vi.fn(),
}));

// Mock SWR to control data fetching behavior
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher, options) => {
    return {
      data: options?.fallbackData || [],
      mutate: vi.fn(),
    };
  }),
}));

// Mock TodoCreateForm component
vi.mock('./TodoCreateForm', () => ({
  TodoCreateForm: ({ open, onOpenChange, onSuccess }: any) => 
    open ? (
      <div data-testid="todo-create-form">
        <button onClick={() => onOpenChange(false)}>Close</button>
        <button onClick={() => onSuccess()}>Success</button>
      </div>
    ) : null,
}));

describe('TodoList', () => {
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
    {
      id: '3',
      title: 'Test TODO 3',
      description: 'Description 3',
      dueDate: '2024-12-20',
      priority: 3,
      completed: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ];

  const mockToggleTodoAction = vi.mocked(toggleTodoAction);
  const mockDeleteTodoAction = vi.mocked(deleteTodoAction);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the title', () => {
    render(<TodoList initialTodos={mockTodos} />);
    expect(screen.getByText('TODOリスト')).toBeInTheDocument();
  });

  it('should render all todos', () => {
    render(<TodoList initialTodos={mockTodos} />);
    
    expect(screen.getByText('Test TODO 1')).toBeInTheDocument();
    expect(screen.getByText('Test TODO 2')).toBeInTheDocument();
    expect(screen.getByText('Test TODO 3')).toBeInTheDocument();
  });

  it('should display empty state when no todos', () => {
    render(<TodoList initialTodos={[]} />);
    
    expect(screen.getByText('TODOがありません。新しいTODOを作成してください。')).toBeInTheDocument();
  });

  it('should display todo details correctly', () => {
    render(<TodoList initialTodos={[mockTodos[0]]} />);
    
    expect(screen.getByText('Test TODO 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('期日: 2024年12月31日')).toBeInTheDocument();
    expect(screen.getByText('高')).toBeInTheDocument(); // Priority badge
  });

  it('should display correct priority badges', () => {
    render(<TodoList initialTodos={mockTodos} />);
    
    expect(screen.getByText('高')).toBeInTheDocument(); // Priority 1
    expect(screen.getByText('中')).toBeInTheDocument(); // Priority 2
    expect(screen.getByText('低')).toBeInTheDocument(); // Priority 3
  });

  it('should show completed todos with reduced opacity and strikethrough', () => {
    render(<TodoList initialTodos={mockTodos} />);
    
    const completedTodoCard = screen.getByText('Test TODO 2').closest('.opacity-60');
    expect(completedTodoCard).toBeInTheDocument();
    
    // The title is wrapped in a label with the line-through class applied to CardTitle
    const completedTodoTitle = screen.getByText('Test TODO 2').closest('.text-lg');
    expect(completedTodoTitle).toHaveClass('line-through');
  });

  it('should handle checkbox toggle', async () => {
    const user = userEvent.setup();
    mockToggleTodoAction.mockResolvedValueOnce({ status: 'success' });
    
    render(<TodoList initialTodos={mockTodos} />);
    
    const checkbox = screen.getAllByRole('checkbox')[0]; // First todo checkbox
    await user.click(checkbox);
    
    await waitFor(() => {
      expect(mockToggleTodoAction).toHaveBeenCalledWith('1');
    });
  });

  it('should handle delete button click', async () => {
    const user = userEvent.setup();
    mockDeleteTodoAction.mockResolvedValueOnce({ status: 'success' });
    
    render(<TodoList initialTodos={mockTodos} />);
    
    const deleteButtons = screen.getAllByText('削除');
    await user.click(deleteButtons[0]); // Delete first todo
    
    await waitFor(() => {
      expect(mockDeleteTodoAction).toHaveBeenCalledWith('1');
    });
  });

  it('should open create dialog when new todo button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoList initialTodos={mockTodos} />);
    
    const newTodoButton = screen.getByText('新しいTODO');
    await user.click(newTodoButton);
    
    expect(screen.getByTestId('todo-create-form')).toBeInTheDocument();
  });

  it('should close create dialog when close is triggered', async () => {
    const user = userEvent.setup();
    render(<TodoList initialTodos={mockTodos} />);
    
    // Open dialog
    const newTodoButton = screen.getByText('新しいTODO');
    await user.click(newTodoButton);
    
    // Close dialog
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);
    
    expect(screen.queryByTestId('todo-create-form')).not.toBeInTheDocument();
  });

  it('should have checkboxes checked for completed todos', () => {
    render(<TodoList initialTodos={mockTodos} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked(); // First todo is not completed
    expect(checkboxes[1]).toBeChecked(); // Second todo is completed
    expect(checkboxes[2]).not.toBeChecked(); // Third todo is not completed
  });

  it('should format dates in Japanese format', () => {
    render(<TodoList initialTodos={[mockTodos[0]]} />);
    
    expect(screen.getByText('期日: 2024年12月31日')).toBeInTheDocument();
  });

  it('should disable controls while pending', async () => {
    const user = userEvent.setup();
    let resolveToggle: ((value: any) => void) | null = null;
    const togglePromise = new Promise((resolve) => {
      resolveToggle = resolve;
    });
    mockToggleTodoAction.mockReturnValueOnce(togglePromise as any);
    
    render(<TodoList initialTodos={mockTodos} />);
    
    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);
    
    // Check that controls are disabled during pending state
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      const deleteButtons = screen.getAllByText('削除');
      
      checkboxes.forEach(cb => {
        expect(cb).toBeDisabled();
      });
      
      deleteButtons.forEach(btn => {
        expect(btn).toBeDisabled();
      });
    });
    
    // Resolve the promise and wait for updates
    await waitFor(async () => {
      resolveToggle!({ status: 'success' });
    });
  });
});