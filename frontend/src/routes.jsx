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
import FindApplicantsPage from './pages/FindApplicantsPage';
import InboxPage from './pages/InboxPage';
import About from './pages/About';
import FAQ from './pages/FAQ';
import ProtectedRoute from './components/ProtectedRoute';
import ChallengeCenter from './pages/ChallengeCenter';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path='/signup' element={<Login />} />
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
        path="/post-job"
        element={
          <ProtectedRoute>
            <CreateJob />
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
      <Route
        path="/find-applicants"
        element={
          <ProtectedRoute>
            <FindApplicantsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        }
      />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/challenge-center" element={<ChallengeCenter />} />
    </Routes>
  );
};

export default AppRoutes;