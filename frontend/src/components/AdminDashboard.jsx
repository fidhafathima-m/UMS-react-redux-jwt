import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers } from '../store/userSlice'
import userService from '../services/userService'
import { logout } from '../store/authSlice'

const AdminDashboard = () => {
    const dispatch = useDispatch()
    const {users, isLoading} = useSelector(state => state.users)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredUsers, setFilteredUsers] = useState([])
    const [editingUser, setEditingUser] = useState(null)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newUser, setNewUser] = useState({
        name: '', email: '', role: 'user'
    })

    useEffect(() => {
        dispatch(fetchUsers)
    }, [dispatch])

    useEffect(() => {
        if(searchQuery) {
            const filtered = users.filter(user => 
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) 
            )
            setFilteredUsers(filtered)
        } else {
            setFilteredUsers(users)
        }
    }, [searchQuery, users])

    const handleDeletUser = async(userId) => {
        if(window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(userId)
                dispatch(fetchUsers()) //refresh list
            } catch (error) {
                alert(`Error deleting user: ${error.message}`)
            }
        }
    }

    const handleEditUser = async(user) => {
        setEditingUser({...user})
    }

    const handleUpdateUser = async () => {
        try {
            await userService.updateProfile(editingUser._id, editingUser)
            setEditingUser(null)
            dispatch(fetchUsers())
        } catch (error) {
            alert(`Error updating user: ${error.message}`)
        }
    }

    const handleCreateUser = async() => {
        try {
            await userService.createUser(newUser)
            setShowCreateForm(false)
            setNewUser({name: '', email: '', role: 'user'})
            dispatch(fetchUsers())
        } catch (error) {
            alert(`Error craeting user: ${error.message}`)
        }
    }

    if(isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        )
    }

  return (
     <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header with Search and Create Button */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li key={user._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={user.profileImage || '/api/placeholder/40/40'}
                      alt={user.name}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletUser(user._id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Create New User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard