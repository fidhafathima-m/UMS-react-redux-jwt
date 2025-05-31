import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'
import { useNavigate } from 'react-router-dom'
import './HomePage.css' // Import the CSS file

const HomePage = () => {
    const {user} = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const backendUrl = 'http://localhost:5000';

    const handleProfileClick = () => {
        console.log('Navigating to profile');
        navigate('/profile');
    };

    const handleLogout = () => {
        if(window.confirm('Are you sure to logout?')) {
            dispatch(logout())
        }
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
                                src={user.profileImage ? `${backendUrl}${user.profileImage}` : 'https://via.placeholder.com/40'}
                                alt={user.name}
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