import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation/Navigation';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import EventList from './components/EventList/EventList';
import MessageWall from './components/MessageWall/MessageWall';
import EventCreation from './components/Admin/EventCreation';
import Moderation from './components/Admin/Moderation';
import './App.css';

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
      <div className="App">
        <Navigation />
        <main className="content">
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
            <Route path="/" element={<EventList />} />
          </Routes>
        </main>
      </div>
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