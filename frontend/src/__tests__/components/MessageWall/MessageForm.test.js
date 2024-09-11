import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MessageForm from '../../../components/MessageWall/MessageForm';
import { AuthProvider } from '../../../context/AuthContext';
import api from '../../../services/api';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

// Mock the dependencies
jest.mock('../../../services/api');
jest.mock('../../../utils/toast');
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

describe('MessageForm Component', () => {
  const mockProps = {
    eventId: 'event123',
    onMessageSent: jest.fn(),
    replyTo: null,
    setReplyTo: jest.fn(),
    cooldown: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders message form', () => {
    render(<MessageForm {...mockProps} />);
    expect(screen.getByPlaceholderText('Your Name (optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('allows entering name and message', () => {
    render(<MessageForm {...mockProps} />);
    const nameInput = screen.getByPlaceholderText('Your Name (optional)');
    const messageInput = screen.getByPlaceholderText('Type a message...');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(messageInput, { target: { value: 'Hello, world!' } });

    expect(nameInput.value).toBe('John Doe');
    expect(messageInput.value).toBe('Hello, world!');
  });

  test('submits message successfully', async () => {
    api.post.mockResolvedValueOnce({ data: { content: 'Hello, world!' } });

    render(<MessageForm {...mockProps} />);
    const messageInput = screen.getByPlaceholderText('Type a message...');
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(messageInput, { target: { value: 'Hello, world!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/messages', expect.objectContaining({
        content: 'Hello, world!',
        eventId: 'event123',
      }));
      expect(showSuccessToast).toHaveBeenCalledWith('Message sent successfully');
      expect(mockProps.onMessageSent).toHaveBeenCalled();
    });
  });

  test('handles error on message submission', async () => {
    const errorMessage = 'Failed to send message';
    api.post.mockRejectedValueOnce(new Error(errorMessage));

    render(<MessageForm {...mockProps} />);
    const messageInput = screen.getByPlaceholderText('Type a message...');
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(messageInput, { target: { value: 'Hello, world!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith(`Failed to send message: ${errorMessage}`);
    });
  });

  test('disables submit button when message is empty', () => {
    render(<MessageForm {...mockProps} />);
    const submitButton = screen.getByRole('button', { name: /send/i });
    expect(submitButton).toBeDisabled();
  });

  test('disables submit button when cooldown is active', () => {
    render(<MessageForm {...mockProps} cooldown={5} />);
    const submitButton = screen.getByRole('button', { name: /wait 5s/i });
    expect(submitButton).toBeDisabled();
  });

  test('adds emoji to message', () => {
    render(<MessageForm {...mockProps} />);
    const emojiButton = screen.getByRole('button', { name: /add emoji/i });
    fireEvent.click(emojiButton);

    const emojiOption = screen.getByText('😀');
    fireEvent.click(emojiOption);

    const messageInput = screen.getByPlaceholderText('Type a message...');
    expect(messageInput.value).toBe('😀');
  });

  test('renders reply information when replyTo is provided', () => {
    const replyToProps = {
      ...mockProps,
      replyTo: { _id: 'reply123', content: 'Original message', user: { username: 'Alice' } },
    };
    render(<MessageForm {...replyToProps} />);
    expect(screen.getByText('Replying to Alice:')).toBeInTheDocument();
    expect(screen.getByText('Original message')).toBeInTheDocument();
  });
});
