import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import SavedEvents from '../../components/SavedEvents';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/HUDlayout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({ user: { id: '1' } }),
}));

describe('SavedEvents Component', () => {
  const renderSavedEvents = () => {
    render(
      <Router>
        <AuthProvider>
          <SavedEvents />
        </AuthProvider>
      </Router>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders saved events page', async () => {
    const mockEvents = [
      { _id: '1', name: 'Saved Event 1', description: 'Description 1', startTime: '2023-06-01T10:00:00Z', endTime: '2023-06-01T12:00:00Z' },
      { _id: '2', name: 'Saved Event 2', description: 'Description 2', startTime: '2023-06-02T10:00:00Z', endTime: '2023-06-02T12:00:00Z' },
    ];

    api.get.mockResolvedValue({ data: mockEvents });

    renderSavedEvents();

    await waitFor(() => expect(screen.getByText('Loading...')).toBeInTheDocument(), { timeout: 5000 });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/users/saved-events');
    }, { timeout: 5000 });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Saved Events')).toBeInTheDocument();
      expect(screen.getByText('Saved Event 1')).toBeInTheDocument();
      expect(screen.getByText('Saved Event 2')).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 20000);
});
