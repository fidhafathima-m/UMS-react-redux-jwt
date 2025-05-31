import { useEffect, useState } from 'react';
import './App.css';
import { useDispatch } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { Login, ProtectedRoute } from './components/Login/Login.jsx';
import HomePage from './components/Home/HomePage.jsx';
import UserProfile from './components/Profile/UserProfile.jsx';
import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import { fetchUserProfile, logout } from './store/authSlice.js';
import { Navigate } from 'react-router-dom';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsInitialized(true);
        return;
      }

      await dispatch(fetchUserProfile()).unwrap();
    } catch (error) {
      console.error('Authentication failed:', error);
      dispatch(logout());
    } finally {
      setIsInitialized(true);
    }
  };

  initializeAuth();
}, [dispatch]);


  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;