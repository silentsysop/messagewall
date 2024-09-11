import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Message from '../../../components/MessageWall/Message';

// Mock the Lucide React icons
jest.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="trash-icon" />,
  ReplyIcon: () => <div data-testid="reply-icon" />,
}));

describe('Message Component', () => {
  const mockMessage = {
    _id: '1',
    content: 'Test message',
    createdAt: new Date().toISOString(),
    user: { username: 'testuser', role: 'user' },
  };

  const mockOnDelete = jest.fn();
  const mockOnReply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders message content', () => {
    render(<Message message={mockMessage} canDelete={false} onDelete={mockOnDelete} onReply={mockOnReply} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('displays user name', () => {
    render(<Message message={mockMessage} canDelete={false} onDelete={mockOnDelete} onReply={mockOnReply} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('shows admin badge for organizer', () => {
    const adminMessage = { ...mockMessage, user: { ...mockMessage.user, role: 'organizer' } };
    render(<Message message={adminMessage} canDelete={false} onDelete={mockOnDelete} onReply={mockOnReply} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('renders delete button when canDelete is true', () => {
    render(<Message message={mockMessage} canDelete={true} onDelete={mockOnDelete} onReply={mockOnReply} />);
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
  });

  test('does not render delete button when canDelete is false', () => {
    render(<Message message={mockMessage} canDelete={false} onDelete={mockOnDelete} onReply={mockOnReply} />);
    expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument();
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<Message message={mockMessage} canDelete={true} onDelete={mockOnDelete} onReply={mockOnReply} />);
    fireEvent.click(screen.getByTestId('trash-icon').closest('button'));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test('calls onReply when reply button is clicked', () => {
    render(<Message message={mockMessage} canDelete={false} onDelete={mockOnDelete} onReply={mockOnReply} />);
    fireEvent.click(screen.getByTestId('reply-icon').parentElement);
    expect(mockOnReply).toHaveBeenCalledTimes(1);
    expect(mockOnReply).toHaveBeenCalledWith(mockMessage, expect.any(Function));
  });

  test('renders replied message when replyTo is present', () => {
    const messageWithReply = {
      ...mockMessage,
      replyTo: { content: 'Original message', user: { username: 'originaluser' } },
    };
    render(<Message message={messageWithReply} canDelete={false} onDelete={mockOnDelete} onReply={mockOnReply} />);
    expect(screen.getByText('Replying to originaluser:')).toBeInTheDocument();
    expect(screen.getByText('Original message')).toBeInTheDocument();
  });
});
