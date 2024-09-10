import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import EventCreation from '../../../components/Admin/EventCreation';
import api from '../../../services/api';

jest.mock('../../../services/api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('EventCreation Component', () => {
  const renderEventCreation = () => {
    render(
      <Router>
        <AuthProvider>
          <EventCreation />
        </AuthProvider>
      </Router>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders event creation form', () => {
    renderEventCreation();
    expect(screen.getByLabelText('Event Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Event Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Event Image')).toBeInTheDocument();
    expect(screen.getByLabelText('Enable message cooldown')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Event' })).toBeInTheDocument();
  });

  test('submits form with correct data', async () => {
    const mockEvent = {
      name: 'Test Event',
      description: 'Test Description',
      date: '2023-07-01',
      requiresApproval: false,
      cooldownEnabled: true,
      cooldown: 3
    };

    api.post.mockResolvedValueOnce({ data: mockEvent });

    renderEventCreation();

    fireEvent.change(screen.getByLabelText('Event Name'), { target: { value: mockEvent.name } });
    fireEvent.change(screen.getByLabelText('Event Description'), { target: { value: mockEvent.description } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: mockEvent.date } });
    
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Event Image'), { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/events', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    });
  });

  // Add more tests as needed
});
