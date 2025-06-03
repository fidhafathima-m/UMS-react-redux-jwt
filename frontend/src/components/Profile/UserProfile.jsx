import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "../../store/userSlice";
import { logout } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
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
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const fileInputRef = useRef(null);

    const backendUrl = `${import.meta.env.VITE_API_URL}`;
    const defaultProfileImage = '/uploads/profile_default.jpg';
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            const imageUrl = user.profileImage ? 
                `${backendUrl}${user.profileImage}` : 
                `${backendUrl}${defaultProfileImage}`;
            setPreviewUrl(imageUrl);
        }
    }, [user]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const validate = () => {
        const newErrors = {};
        
        // Name validation
        if (!name.trim()) {
            newErrors.name = 'Name is required';
        } else if (name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (name.length > 50) {
            newErrors.name = 'Name cannot exceed 50 characters';
        }
        
        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        // Image validation
        if (profileImage) {
            if (profileImage.size > MAX_FILE_SIZE) {
                newErrors.profileImage = 'Image must be less than 2MB';
            } else if (!ALLOWED_FILE_TYPES.includes(profileImage.type)) {
                newErrors.profileImage = 'Only JPG, PNG, or GIF images are allowed';
            }
        }
        
        return newErrors;
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        setErrors(validate());
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validationErrors = validate();
            
            if (file.size > MAX_FILE_SIZE) {
                validationErrors.profileImage = 'Image must be less than 2MB';
            } else if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                validationErrors.profileImage = 'Only JPG, PNG, or GIF images are allowed';
            }
            
            setErrors(validationErrors);
            
            if (!validationErrors.profileImage) {
                setProfileImage(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                // Reset file input if invalid
                e.target.value = '';
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validate();
        setErrors(validationErrors);
        setTouched({
            name: true,
            email: true,
            profileImage: true
        });
        
        if (Object.keys(validationErrors).length === 0) {
            setSuccessMessage('');
            
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            try {
                const result = await dispatch(updateUserProfile(formData)).unwrap();
                
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
            }
        }
    };

    const handleLogout = () => {
        if(window.confirm('Are you sure you want to logout?')) {
            dispatch(logout());
        }
    };

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

                        {successMessage && (
                            <div className="success-message">
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="profile-form" noValidate>
                            <div className="image-section">
                                <div>
                                    <img
                                        className="profile-image"
                                        src={previewUrl || `${backendUrl}${defaultProfileImage}`}
                                        alt="Profile"
                                        onError={(e) => {
                                            e.target.src = `${backendUrl}${defaultProfileImage}`;
                                        }}
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
                                    {errors.profileImage && (
                                        <p className="file-error">{errors.profileImage}</p>
                                    )}
                                </div>
                            </div>

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
                                        onBlur={() => handleBlur('name')}
                                        className={`form-input ${touched.name && errors.name ? 'input-error' : ''}`}
                                    />
                                    {touched.name && errors.name && (
                                        <span className="field-error">{errors.name}</span>
                                    )}
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
                                        onBlur={() => handleBlur('email')}
                                        className={`form-input ${touched.email && errors.email ? 'input-error' : ''}`}
                                    />
                                    {touched.email && errors.email && (
                                        <span className="field-error">{errors.email}</span>
                                    )}
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
    );
};

export default UserProfile;