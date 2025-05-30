import React, {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { clearError, loginUser, registerUser } from '../store/authSlice'


const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRegister, setIsRegister] = useState(false)
    const [name, setName] = useState('')

    const dispatch = useDispatch();
    const {isLoading, error, isAuthenticated} = useSelector((state) => state.auth)

    const handleSubmit = (e) => {
      console.log('vlivked')
        e.preventDefault();
        if(isRegister) {
            dispatch(registerUser({name, email, password}))
        } else {
            dispatch(loginUser({email, password}))
        }
    }

    if(isAuthenticated) {
        return <div>Redirecting to home...</div>
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
    
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>
        </div>
        <form className="mt-8 space-y-6"
          onSubmit={handleSubmit}>
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
              type="submit"
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
              onClick={() => {
                setIsRegister(!isRegister)
                dispatch(clearError())
              }}
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ProtectedRoute = ({children, adminOnly = false}) => {
    const {isAuthenticated, user} = useSelector((state) => state.auth)

    if(!isAuthenticated) {
        return <div>Please Login to access this page</div>
    }

    if(adminOnly && user?.role !== 'admin') {
        return <div>Access denied. Admin Privilages required</div>
    }
    return children
}

export {Login, ProtectedRoute}