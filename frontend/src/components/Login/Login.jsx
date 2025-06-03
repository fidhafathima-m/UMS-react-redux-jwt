import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, loginUser, registerUser } from '../../store/authSlice';
import { useNavigate, Navigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Validation rules
  const validate = () => {
    const newErrors = {};
    
    if (isRegister && (!name || name.trim() === '')) {
      newErrors.name = 'Name is required';
    } else if (isRegister && name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors(validate());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({
      name: true,
      email: true,
      password: true
    });
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        if (isRegister) {
          await dispatch(registerUser({ name, email, password })).unwrap();
        } else {
          await dispatch(loginUser({ email, password })).unwrap();
        }
      } catch (error) {
        console.error('Login/Register failed:', error);
      }
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

        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="error-message">{error}</div>}

          {isRegister && (
            <div className="input-group">
              <input
                type="text"
                required
                className={`input-field ${touched.name && errors.name ? 'error' : ''}`}
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
              />
              {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              required
              className={`input-field ${touched.email && errors.email ? 'error' : ''}`}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
            />
            {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="input-group">
            <input
              type="password"
              required
              className={`input-field ${touched.password && errors.password ? 'error' : ''}`}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
            />
            {touched.password && errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="submit-button"
          >
            {isLoading ? 'Loading...' : isRegister ? 'Sign Up' : 'Sign In'}
          </button>

          <button
            type="button"
            className="toggle-button"
            onClick={() => {
              setIsRegister(!isRegister);
              dispatch(clearError());
              setErrors({});
              setTouched({});
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

export { Login, ProtectedRoute };