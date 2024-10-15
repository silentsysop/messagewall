import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MessageWall from './components/MessageWall/MessageWall';
import EventCreation from './components/Admin/EventCreation';
import Moderation from './components/Admin/Moderation';
import PastEvents from './components/PastEvents';
import { ThemeProvider } from './context/ThemeContext';
import { AdminActions } from './components/AdminActions';

import './globals.css';
import MainPage from './components/MainPage';
import SavedEvents from './components/SavedEvents';

function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {

  const basename = process.env.REACT_APP_BASENAME || '';

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/event/:id" element={<MessageWall />} />
        <Route
          path="/create-event"
          element={
            <RequireAuth allowedRoles={['organizer']}>
              <EventCreation />
            </RequireAuth>
          }
        />
        <Route
          path="/moderate"
          element={
            <RequireAuth allowedRoles={['organizer']}>
              <Moderation />
            </RequireAuth>
          }
        />
        <Route path="/" element={<MainPage />} />
        <Route path="/saved-events" element={<SavedEvents />} />
        <Route path="/past-events" element={<PastEvents />} />
        <Route
          path="/admin-actions"
          element={
            <RequireAuth allowedRoles={['organizer']}>
              <AdminActions />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          reverseOrder={true}
          toastOptions={{
            duration: 5000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              padding: '8px',
              borderRadius: 'var(--radius)',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
