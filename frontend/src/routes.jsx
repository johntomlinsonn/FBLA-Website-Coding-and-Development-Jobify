import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import JobsList from './pages/JobsList';
import JobDetails from './pages/JobDetails';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import Account from './pages/Account';
import JobApplication from './pages/JobApplication';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
      <Route
        path="/jobs/:id/apply"
        element={
          <ProtectedRoute>
            <JobApplication />
          </ProtectedRoute>
        }
      />
        <Route
          path="/jobs/create"
          element={
            <ProtectedRoute>
              <CreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/edit"
          element={
            <ProtectedRoute>
              <EditJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
    </Routes>
  );
};

export default AppRoutes; 