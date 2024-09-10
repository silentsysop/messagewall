import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Layout from '../../components/HUDlayout';

jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    user: null,
    logout: jest.fn(),
  }),
}));

describe('HUDlayout Component', () => {
  const renderLayout = (children) => {
    render(
      <Router>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </Router>
    );
  };

  test('renders layout with children', () => {
    renderLayout(<div data-testid="child">Child Component</div>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderLayout(<div />);
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    expect(screen.getByText('Past Events')).toBeInTheDocument();
    expect(screen.getByText('Saved Events')).toBeInTheDocument();
  });

  // Add more tests as needed
});
