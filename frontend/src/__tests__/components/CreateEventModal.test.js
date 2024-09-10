import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CreateEventModal } from '../../components/CreateEventModal';
import api from '../../services/api';

jest.mock('../../services/api');

describe('CreateEventModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnEventCreated = jest.fn();

  const renderCreateEventModal = (isOpen = true) => {
    render(
      <Router>
        <AuthProvider>
          <CreateEventModal 
            isOpen={isOpen} 
            onClose={mockOnClose}
            onEventCreated={mockOnEventCreated}
          />
        </AuthProvider>
      </Router>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('submits form with correct data', async () => {
    const mockEvent = {
      name: 'Test Event',
      description: 'Test Description',
      startTime: '2023-07-01T10:00',
      endTime: '2023-07-01T12:00',
      requiresApproval: false,
      cooldownEnabled: true,
      cooldown: 3
    };
  
    api.post.mockResolvedValueOnce({ data: mockEvent });
  
    renderCreateEventModal();
  
    fireEvent.change(screen.getByLabelText('Event Name'), { target: { value: mockEvent.name } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: mockEvent.description } });
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: mockEvent.startTime } });
    fireEvent.change(screen.getByLabelText('End Time'), { target: { value: mockEvent.endTime } });
  
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }));
  
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/events', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      expect(mockOnEventCreated).toHaveBeenCalledWith(mockEvent);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // Add more tests as needed
});
