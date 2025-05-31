import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateUserProfile } from "../../store/userSlice"
import { logout } from "../../store/authSlice"
import { useNavigate } from "react-router-dom"
import "./UserProfile.css";

const UserProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const { isLoading, error } = useSelector((state) => state.users);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef(null);

    const backendUrl = 'http://localhost:5000';

    useEffect(() => {
        console.log('UserProfile component mounted');
    }, []);

    // Initialize state when component mounts or user data changes
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPreviewUrl(user.profileImage ? `${backendUrl}${user.profileImage}` : '');
        }
    }, [user]);

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file !== profileImage) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    
    if (profileImage) {
        formData.append('profileImage', profileImage);
    }

    try {
        console.log('Submitting profile update...');
        const result = await dispatch(updateUserProfile(formData)).unwrap();
        console.log('Profile update successful:', result);
        
        // Update local state with the returned user data
        if (result.user) {
            setName(result.user.name);
            setEmail(result.user.email);
            if (result.user.profileImage) {
                setPreviewUrl(`${backendUrl}${result.user.profileImage}`);
            }
        }

        dispatch({
            type: 'auth/setUser',
            payload: result.user,
        });
        
        setSuccessMessage('Profile updated successfully!');
        setProfileImage(null);
        
        setTimeout(() => {
            setSuccessMessage('Redirecting to home..!');
            navigate('/home');
        }, 1000);
        
    } catch (error) {
        console.error('Update failed:', error);
        // Error handling is already done by Redux
    }
};

const handleLogout = () => {
    if(window.confirm('Are you sure you want to logout?')) {
        dispatch(logout())
    }
}

    return (
        <div className="profile-container">
            <nav className="profile-nav">
                <div className="nav-content">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/home')}
                            className="back-button"
                        >
                            ← Back
                        </button>
                        <h1 className="nav-title">User Profile</h1>
                    </div>
                    <div>
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
                <div className="profile-card">
                    <div className="profile-content">
                        <h3 className="profile-header">
                            Profile Information
                        </h3>

                        {/* Success Message */}
                        {successMessage && (
                            <div className="success-message">
                                {successMessage}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="profile-form">
                            {/* Profile Image Section */}
                            <div className="image-section">
                                <div>
                                    <img
                                        className="profile-image"
                                        src={previewUrl ? previewUrl : `${backendUrl}${user.profileImage}`}
                                        alt="Profile"
                                    />
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="change-photo-btn"
                                    >
                                        Change Photo
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="file-input"
                                    />
                                    <p className="image-hint">
                                        JPG, GIF or PNG. 2MB max.
                                    </p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="save-btn"
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default UserProfile