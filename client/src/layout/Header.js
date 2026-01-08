// client/src/components/Header/Header.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';
const Header = ({ title = "Dashboard", showSignOut = true, onSignOut, children }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { signOut: authSignOut } = useAuth();

    /**
     * Handles the sign out process for the client user.
     * Signs out the user and redirects to the home page.
     * @async
     * @function handleSignOut
     * @returns {Promise<void>}
     * @throws {Error} If sign out fails
     */
    const handleSignOutClick = async () => {
        if (onSignOut) {
            await onSignOut();
        } else {
            try {
                await authSignOut();
                navigate('/');
            } catch (error) {
                console.error('Failed to sign out:', error);
            }
        }
    };
    return (
        <header className="dashboard-header">
            <h1>{title}</h1>
            <div className="header-content">
                <div className="header-actions">
                    {children}  {/* Your action buttons go here */}
                </div>
                <div className="user-section">
                    {currentUser?.email && <span className="user-email">{currentUser.email}</span>}
                    {showSignOut && (
                        <button onClick={handleSignOutClick} className="sign-out-btn">
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
export default Header;