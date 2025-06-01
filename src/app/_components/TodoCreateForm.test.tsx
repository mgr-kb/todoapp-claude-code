/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoCreateForm } from './TodoCreateForm';
import { createTodoAction } from '@/app/actions';

// Mock the actions module
vi.mock('@/app/actions', () => ({
  createTodoAction: vi.fn(),
}));

// Mock the Dialog component to render its content directly
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => 
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the Select component to render a simple select
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, name, defaultValue }: any) => {
    // Extract option elements from children
    const options: any[] = [];
    const extractOptions = (child: any): void => {
      if (child?.type?.name === 'SelectItem' || child?.props?.value) {
        options.push(child);
      } else if (child?.props?.children) {
        const children = Array.isArray(child.props.children) ? child.props.children : [child.props.children];
        children.forEach(extractOptions);
      }
    };
    
    if (Array.isArray(children)) {
      children.forEach(extractOptions);
    } else {
      extractOptions(children);
    }
    
    return (
      <select name={name} defaultValue={defaultValue} role="combobox" id={`${name}-select`}>
        {options.map((opt, i) => (
          <option key={i} value={opt.props.value}>{opt.props.children}</option>
        ))}
      </select>
    );
  },
  SelectTrigger: ({ children }: any) => children,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => children,
  SelectItem: ({ value, children }: any) => ({ type: { name: 'SelectItem' }, props: { value, children } }),
}));

describe('TodoCreateForm', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockCreateTodoAction = vi.mocked(createTodoAction);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open is true', () => {
    render(
      <TodoCreateForm 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    expect(screen.getByText('新しいTODOを追加')).toBeInTheDocument();
    expect(screen.getByText('新しいタスクの詳細を入力してください。')).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    render(
      <TodoCreateForm 
        open={false} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    expect(screen.queryByText('新しいTODOを追加')).not.toBeInTheDocument();
  });

  it('should display all form fields', () => {
    render(
      <TodoCreateForm 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('期日')).toBeInTheDocument();
    expect(screen.getByText('優先度')).toBeInTheDocument();
  });

  it('should set default due date to tomorrow', () => {
    render(
      <TodoCreateForm 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    const dueDateInput = screen.getByLabelText('期日') as HTMLInputElement;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expectedDate = tomorrow.toISOString().split('T')[0];
    
    expect(dueDateInput.value).toBe(expectedDate);
  });

  it('should set default priority to medium (2)', () => {
    render(
      <TodoCreateForm 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    const prioritySelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(prioritySelect.value).toBe('2');
  });

  it('should call onOpenChange when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TodoCreateForm 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    const cancelButton = screen.getByText('キャンセル');
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    mockCreateTodoAction.mockResolvedValueOnce({ status: 'success' });
    
    render(
      <TodoCreateForm 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    // Fill in the form
    await user.type(screen.getByLabelText('タイトル'), 'Test TODO');
    await user.type(screen.getByLabelText('説明'), 'Test description');
    await user.clear(screen.getByLabelText('期日'));
    await user.type(screen.getByLabelText('期日'), '2024-12-31');

    // Submit the form
    const submitButton = screen.getByText('TODOを作成');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTodoAction).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display error message when submission fails', async () => {
    const user = userEvent.setup();
    mockCreateTodoAction.mockResolvedValueOnce({
      status: 'error',
      error: {
        form: ['TODOの作成に失敗しました'],
      },
    });
    
    render(
      <TodoCreateForm 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    // Fill in the form
    await user.type(screen.getByLabelText('タイトル'), 'Test TODO');
    await user.type(screen.getByLabelText('説明'), 'Test description');

    // Submit the form
    const submitButton = screen.getByText('TODOを作成');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('TODOの作成に失敗しました')).toBeInTheDocument();
      expect(mockOnOpenChange).not.toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    let resolvePromise: ((value: any) => void) | null = null;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockCreateTodoAction.mockReturnValueOnce(promise as any);
    
    render(
      <TodoCreateForm 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    // Fill in the form
    await user.type(screen.getByLabelText('タイトル'), 'Test TODO');
    await user.type(screen.getByLabelText('説明'), 'Test description');

    // Submit the form
    const submitButton = screen.getByText('TODOを作成');
    await user.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('作成中...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    // Resolve the promise and wait for updates
    await waitFor(async () => {
      resolvePromise!({ status: 'success' });
    });
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    mockCreateTodoAction.mockResolvedValueOnce({ status: 'success' });
    
    const { rerender } = render(
      <TodoCreateForm 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    // Fill in the form
    const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
    const descriptionInput = screen.getByLabelText('説明') as HTMLTextAreaElement;
    
    await user.type(titleInput, 'Test TODO');
    await user.type(descriptionInput, 'Test description');

    // Verify values were entered
    expect(titleInput).toHaveValue('Test TODO');
    expect(descriptionInput).toHaveValue('Test description');

    // Submit the form
    const submitButton = screen.getByText('TODOを作成');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    // Re-render with open=false then true to simulate closing and reopening
    rerender(
      <TodoCreateForm 
        open={false} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );
    
    rerender(
      <TodoCreateForm 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    // Check that form is reset
    const newTitleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
    const newDescriptionInput = screen.getByLabelText('説明') as HTMLTextAreaElement;
    
    expect(newTitleInput).toHaveValue('');
    expect(newDescriptionInput).toHaveValue('');
  });
});