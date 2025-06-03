import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

const HomePage = () => {
    const {user} = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const backendUrl = `${import.meta.env.VITE_API_URL}`;
    const defaultProfileImage = '/uploads/profile_default.jpg';

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const handleLogout = () => {
        if(window.confirm('Are you sure to logout?')) {
            dispatch(logout())
        }
    }

     const getProfileImageUrl = () => {
        if (!user?.profileImage) {
            return `${backendUrl}${defaultProfileImage}`;
        }
        
        if (user.profileImage.startsWith('http') || user.profileImage.startsWith('/uploads')) {
            return user.profileImage.includes(backendUrl) ? 
                   user.profileImage : 
                   `${backendUrl}${user.profileImage}`;
        }
        
        return `${backendUrl}${user.profileImage}`;
    }
    return (
        <div className="home-container">
            <nav className="nav-bar">
                <div className="nav-content">
                    <div>
                        <h1 className="nav-title">Dashboard</h1>
                    </div>
                    <div className="nav-buttons">
                        <div className="current-user-info">
                            <img
                                className="current-user-avatar"
                                src={getProfileImageUrl()}
                                alt={user?.name || 'User'}
                                onError={(e) => {
                                    e.target.src = `${backendUrl}${defaultProfileImage}`;
                                }}
                            />
                            <span>{user.name}</span>
                        </div>
                        <button
                            onClick={handleProfileClick}
                            className="profile-btn"
                        >
                            Profile
                        </button>
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
                <div className="dashboard-container">
                    <div className="dashboard-content">
                        <h2 className="dashboard-title">
                            Welcome to Your Dashboard
                        </h2>
                        <p className="dashboard-text">
                            This is your home page. Use the navigation to access your profile.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default HomePage;