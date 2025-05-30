
import { useState } from 'react'
import './App.css'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import authService from './services/authService'
import { setCurrentUser } from './store/userSlice'
import { Login, ProtectedRoute } from './components/Login'
import { HomePage, UserProfile } from './components/HomePage'
import AdminDashboard from './components/AdminDashboard'
import { loginUser, registerUser } from './store/authSlice'

function App() {
  const [currentPage, setCurrectPage] = useState('login')
  const [isInitialized, setIsInitialized] = useState(false)
  const {user} = useSelector(state => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('token')
      if(token) {
        try {
          const userData = await authService.getCurrentUser()
          dispatch(setCurrentUser(userData))
          if(userData.role === 'admin') {
            setCurrectPage('admin')
          } else {
            setCurrectPage('home')
          }
        } catch (error) {
          alert(`Error occured: ${error.message}`)
          localStorage.removeItem('token')
          setCurrectPage('login')
        }
      }
      setIsInitialized(true)
    }
    initializeApp()
  }, [dispatch])

  const navigate = (page) => {
    setCurrectPage(page)
  }

  if(!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const rederCurrentPage = () => {
    switch(currentPage) {
      case 'login':
        return <Login onLoginSuccess={() => navigate(user?.role === 'admin' ? 'admin' : 'home')}/>

      case 'home':
        return (
          <ProtectedRoute>
            <HomePage onNavigateToProfile={() => navigate('profile')}/>
          </ProtectedRoute>
        )

      case 'profile':
        return (
          <ProtectedRoute>
            <UserProfile onNavigateBack={() => navigate('home')}/>
          </ProtectedRoute>
        )

      case 'admin':
        return (
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard/>
          </ProtectedRoute>
        )

      default: 
        return <Login onLoginSuccess={() => navigate(user?.role === 'admin' ? 'admin' : 'home')}/>
    }
  }

  return (
   <div className="App">
      {rederCurrentPage()}
    </div>
  )
}

const EnhancedLoginForm = ({onLoginSuccess}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')

  const dispatch = useDispatch()
  const {isLoading, isAuthenticated, error} = useSelector(state => state.auth)

  useEffect(() => {
    if(isAuthenticated && onLoginSuccess) {
      onLoginSuccess()
    }
  }, [isAuthenticated, onLoginSuccess])

  const handleSubmit = (e) => {
    e.preventDefault();
    if(isRegister) {
      dispatch(registerUser({name, email, password}))
    } else {
      dispatch(loginUser({email, password}))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {isRegister && (
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <input
              type="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <input
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : (isRegister ? 'Sign Up' : 'Sign In')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-500"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}



export default App
