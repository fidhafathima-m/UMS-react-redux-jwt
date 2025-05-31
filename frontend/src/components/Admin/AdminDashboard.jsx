import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers } from '../../store/userSlice'
import userService from '../../services/userService'
import { logout } from '../../store/authSlice'
import './AdminDashboard.css'

const AdminDashboard = () => {
    const dispatch = useDispatch()
    const {users, isLoading} = useSelector(state => state.users)
    const { user: currentUser } = useSelector(state => state.auth) 
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredUsers, setFilteredUsers] = useState([])
    const [editingUser, setEditingUser] = useState(null)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newUser, setNewUser] = useState({
        name: '', email: '', role: 'user'
    })
    const [viewMode, setViewMode] = useState('users') 
    const backendUrl = 'http://localhost:5000';

    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    useEffect(() => {
        if (users) {
            let filtered = users;
            
            if (viewMode === 'users') {
                filtered = filtered.filter(user => user.role === 'user');
            } else if (viewMode === 'admins') {
                filtered = filtered.filter(user => user.role === 'admin');
            }
            
            if (searchQuery) {
                filtered = filtered.filter(user => 
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase()) 
                )
            }
            
            setFilteredUsers(filtered)
        }
    }, [searchQuery, users, viewMode])

    const handleDeletUser = async(userId) => {
        if(window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(userId)
                dispatch(fetchUsers()) 
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
            await userService.updateUser(editingUser._id, editingUser)
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

    const handleLogout = () => {
        if(window.confirm("Are you sure to logout?")) {
            dispatch(logout())
        }
    }

    if(isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-text">Loading...</div>
            </div>
        )
    }

    return (
        <div className="admin-container">
            <nav className="admin-nav">
                <div className="nav-inner">
                    <div>
                        <h1 className="nav-title">Admin Dashboard</h1>
                    </div>
                    <div className="nav-right">
                        <div className="current-user-info">
                            <img
                                className="current-user-avatar"
                                src={currentUser.profileImage ? `${backendUrl}${currentUser.profileImage}` : 'https://via.placeholder.com/40'}
                                alt={currentUser.name}
                            />
                            <span>{currentUser.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="logout-btn"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="main-content">
                <div className="search-create-container">
                    
                    <div>
                        <input
                            type="text"
                            placeholder={`Search ${viewMode}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="create-btn"
                    >
                        Create {viewMode === 'admins' ? 'Admin' : 'User'}
                    </button>
                </div>

                    <div className="view-mode-toggle-container">
                        <div className="view-mode-toggle">
                            <button
                                className={`toggle-btn ${viewMode === 'users' ? 'active' : ''}`}
                                onClick={() => setViewMode('users')}
                            >
                                Users
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'admins' ? 'active' : ''}`}
                                onClick={() => setViewMode('admins')}
                            >
                                Admins
                            </button>
                        </div>
                    </div>

                <div className="users-list">
                    <ol>
                        {filteredUsers.map((user) => (
                            <li key={user._id} className="user-item">
                                <div className="user-content">
                                    <div className="user-info">
                                        <img
                                          className="user-avatar"
                                          src={user.profileImage ? `${backendUrl}${user.profileImage}` : 'https://via.placeholder.com/40'}
                                          alt={user.name}
                                        />
                                        <div className="user-details">
                                            <div className="user-name">
                                                {user.name}
                                                {user.email === currentUser.email && (
                                                    <span className="you-badge"> (You)</span>
                                                )}
                                            </div>
                                            <div className="user-email">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="user-actions">
                                        
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="action-btn edit-btn"
                                        >
                                            Edit
                                        </button>
                                        {user.email !== currentUser.email && (
                                            <button
                                                onClick={() => handleDeletUser(user._id)}
                                                className="action-btn delete-btn"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Edit User Modal */}
                {editingUser && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3 className="modal-title">Edit User</h3>
                            <div>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                        className="form-select"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateUser}
                                    className="save-btn"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create User Modal */}
                {showCreateForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3 className="modal-title">Create New {viewMode === 'admins' ? 'Admin' : 'User'}</h3>
                            <div>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                        className="form-select"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateUser}
                                    className="save-btn"
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