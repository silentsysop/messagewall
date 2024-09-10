import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import PastEvents from '../../components/PastEvents';
import api from '../../services/api';

jest.mock('../../services/api');

describe('PastEvents Component', () => {
  const renderPastEvents = () => {
    render(
      <Router>
        <AuthProvider>
          <PastEvents />
        </AuthProvider>
      </Router>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders past events page', async () => {
    const mockEvents = [
      { _id: '1', name: 'Past Event 1', description: 'Description 1', startTime: '2023-01-01T10:00:00Z', endTime: '2023-01-01T12:00:00Z' },
      { _id: '2', name: 'Past Event 2', description: 'Description 2', startTime: '2023-01-02T10:00:00Z', endTime: '2023-01-02T12:00:00Z' },
    ];

    api.get.mockResolvedValueOnce({ data: mockEvents });

    renderPastEvents();

    await screen.findByText((content, element) => {
      return element.tagName.toLowerCase() === 'h1' && content.toLowerCase().includes('past events');
    });

    expect(await screen.findByText('Past Event 1')).toBeInTheDocument();
    expect(await screen.findByText('Past Event 2')).toBeInTheDocument();
  });

  // Add more tests as needed
});
