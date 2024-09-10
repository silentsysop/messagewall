import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import MainPage from '../../components/MainPage';
import api from '../../services/api';

// Mock the api service
jest.mock('../../services/api');

describe('MainPage Component', () => {
  const renderMainPage = () => {
    render(
      <Router>
        <AuthProvider>
          <MainPage />
        </AuthProvider>
      </Router>
    );
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
  });

  test('renders main page with upcoming events', async () => {
    const mockEvents = [
      { _id: '1', name: 'Event 1', description: 'Description 1', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600000).toISOString() },
      { _id: '2', name: 'Event 2', description: 'Description 2', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 7200000).toISOString() },
    ];

    api.get.mockResolvedValueOnce({ data: mockEvents });

    renderMainPage();

    await screen.findByText((content, element) => {
      return element.tagName.toLowerCase() === 'h1' && content.toLowerCase().includes('upcoming events');
    });

    expect(await screen.findByText('Event 1')).toBeInTheDocument();
    expect(await screen.findByText('Event 2')).toBeInTheDocument();
  });

  // Add more tests for other functionalities
});
