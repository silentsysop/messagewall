import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MessageWall from './components/MessageWall/MessageWall';
import EventCreation from './components/Admin/EventCreation';
import Moderation from './components/Admin/Moderation';
import PastEvents from './components/PastEvents';

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
  return (
    <Router>
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
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;