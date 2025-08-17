import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocalizationProvider } from './contexts/LocalizationContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminResults from './components/AdminResults';
import StudentsManagement from './components/StudentsManagement';
import QuestionsManagement from './components/QuestionsManagement';
import ExamsManagement from './components/ExamsManagement';
import SubjectsManagement from './components/SubjectsManagement';
import Dashboard from './components/Dashboard';
import Exam from './components/Exam';
import Results from './components/Results';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAdmin ? children : <Navigate to="/admin/login" />;
};

// Main App Component
const AppContent = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes - Always accessible */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} /> : <Login />
      } />
      <Route path="/admin/login" element={
        isAuthenticated ? <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} /> : <AdminLogin />
      } />
      
      {/* Landing page for unauthenticated users */}
      <Route path="/" element={
        !isAuthenticated ? <LandingPage /> : (
          isAdmin ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />
        )
      } />
      
      {/* Protected Student Routes */}
      <Route path="/exam/:examId" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/results" element={<AdminRoute><AdminResults /></AdminRoute>} />
      <Route path="/admin/students" element={<AdminRoute><StudentsManagement /></AdminRoute>} />
      <Route path="/admin/questions" element={<AdminRoute><QuestionsManagement /></AdminRoute>} />
      <Route path="/admin/exams" element={<AdminRoute><ExamsManagement /></AdminRoute>} />
      <Route path="/admin/subjects" element={<AdminRoute><SubjectsManagement /></AdminRoute>} />
      
      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// App Component with Providers
const App = () => {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </LocalizationProvider>
  );
};

export default App;
