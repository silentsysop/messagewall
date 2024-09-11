import { showSuccessToast, showErrorToast, showInfoToast, showConfirmToast } from '../../utils/toast';
import toast from 'react-hot-toast';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => {
  const actualToast = jest.fn();
  actualToast.success = jest.fn();
  actualToast.error = jest.fn();
  actualToast.dismiss = jest.fn();
  return actualToast;
});

describe('Toast Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('showSuccessToast calls toast.success with correct parameters', () => {
    const message = 'Success message';
    showSuccessToast(message);
    expect(toast.success).toHaveBeenCalledWith(message, expect.objectContaining({
      icon: '✅',
      style: expect.objectContaining({
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--primary))',
      }),
    }));
  });

  test('showErrorToast calls toast.error with correct parameters', () => {
    const message = 'Error message';
    showErrorToast(message);
    expect(toast.error).toHaveBeenCalledWith(message, expect.objectContaining({
      icon: '❌',
      style: expect.objectContaining({
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--destructive))',
      }),
    }));
  });

  test('showInfoToast calls toast with correct parameters', () => {
    const message = 'Info message';
    showInfoToast(message);
    expect(toast).toHaveBeenCalledWith(message, expect.objectContaining({
      style: expect.objectContaining({
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
      }),
    }));
  });

  test('showConfirmToast calls toast with correct parameters', () => {
    const message = 'Confirm action?';
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    showConfirmToast(message, onConfirm, onCancel);

    expect(toast).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        duration: Infinity,
      })
    );

    // Get the rendered component
    const renderFn = toast.mock.calls[0][0];
    const { getByText } = render(renderFn({ id: 'test-toast' }));

    // Check if the message and buttons are rendered
    expect(getByText(message)).toBeInTheDocument();
    expect(getByText('Confirm')).toBeInTheDocument();
    expect(getByText('Cancel')).toBeInTheDocument();

    // Simulate clicking the Confirm button
    fireEvent.click(getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalled();
    expect(toast.dismiss).toHaveBeenCalledWith('test-toast');

    // Simulate clicking the Cancel button
    fireEvent.click(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
    expect(toast.dismiss).toHaveBeenCalledWith('test-toast');
  });
});
