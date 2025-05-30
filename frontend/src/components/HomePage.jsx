import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import { useState } from 'react'
import { useRef } from 'react'
import { updateUserProfile } from '../store/userSlice'

const HomePage = () => {
    const {user} = useSelector((state) => state.auth)
    const dispatch = useDispatch()
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={() => {/* Navigate to profile */}}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Profile
              </button>
              <button
                onClick={() => dispatch(logout())}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Your Dashboard
              </h2>
              <p className="text-gray-600">
                This is your home page. Use the navigation to access your profile.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const UserProfile = () => {
    const {user} = useSelector((state) => state.auth)
    const {isLoading} = useSelector((state) => state.users)
    const dispatch = useDispatch()

    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [profileImage, setProfileImage] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(user?.profileImage || '')
    const fileInputRef = useRef(null)

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if(file) {
            setProfileImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name)
        formData.append('email', email)
        if(profileImage) {
            formData.append('profileImage', profileImage)
        }
        dispatch(updateUserProfile(formData))
    }

    return (
         <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => {/* Navigate back to home */}}
                className="text-indigo-600 hover:text-indigo-500 mr-4"
              >
                ← Back to Home
              </button>
              <h1 className="text-xl font-semibold">User Profile</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => dispatch(logout())}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Profile Information
            </h3>

            <div className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <img
                    className="h-20 w-20 object-cover rounded-full"
                    src={previewUrl || '/api/placeholder/80/80'}
                    alt="Profile"
                  />
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Change Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, GIF or PNG. 2MB max.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    )
}

export {HomePage, UserProfile};