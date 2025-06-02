import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, loginUser, registerUser } from '../../store/authSlice'
import { useNavigate, Navigate } from 'react-router-dom';
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await dispatch(registerUser({ name, email, password })).unwrap();
      } else {
        await dispatch(loginUser({ email, password })).unwrap();
      }
    } catch (error) {
      console.error('Login/Register failed:', error);
    }
  };

  useEffect(() => {
  if (isAuthenticated && user) {
    navigate(user.role === 'admin' ? '/admin' : '/home');
  }
}, [isAuthenticated, user, navigate]);


  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2 className="login-title">{isRegister ? 'Create Account' : 'Sign In'}</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          {isRegister && (
            <input
              type="text"
              required
              className="input-field"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            required
            className="input-field"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? 'Loading...' : isRegister ? 'Sign Up' : 'Sign In'}
          </button>

          <button
            type="button"
            className="toggle-button"
            onClick={() => {
              setIsRegister(!isRegister);
              dispatch(clearError());
            }}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};


const ProtectedRoute = ({ children, adminOnly = false }) => {
    const [isChecking, setIsChecking] = useState(true);
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        const timer = setTimeout(() => setIsChecking(false), 100);
        return () => clearTimeout(timer);
    }, []);

    if (isChecking) {
        return null; 
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export {Login, ProtectedRoute}