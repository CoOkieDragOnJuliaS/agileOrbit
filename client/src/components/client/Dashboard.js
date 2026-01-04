import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from "./KanbanBoard";
import './Dashboard.css';

export default function ClientDashboard() {
    const { currentUser, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    return (
        <div className="dashboard-layout">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Dashboard</h1>
                    <div className="user-profile">
                        <div className="user-avatar">
                            {currentUser?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <span className="user-email">{currentUser?.email}</span>
                            <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Note: No sidebar here anymore! It's provided by the Layout */}
            <div className="dashboard-container">
                <main className="main-content">
                    <div className="content-header">
                        <h2>Welcome back</h2>
                    </div>
                    <div className="kanban-container">
                        <KanbanBoard />
                    </div>
                </main>
            </div>
        </div>
    );
}