import React from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {useNavigate} from 'react-router-dom';
import KanbanBoard from "./KanbanBoard";
import './Dashboard.css';
import Header from "../../layout/Header";

export default function ClientDashboard() {
    const {currentUser, signOut} = useAuth();
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
            <Header
                title="Dashboard"
            />
            {/* Note: No sidebar here anymore! It's provided by the Layout */}
            <div className="dashboard-container">
                <main className="main-content">
                    <div className="content-header">
                        <h2>Welcome back</h2>
                    </div>
                    <div className="kanban-container">
                        <KanbanBoard/>
                    </div>
                </main>
            </div>
        </div>
    );
}