import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-left">

      </div>
      
      <div className="topbar-right">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        
        <div className="user-menu">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || user.githubUsername || 'User'}
              className="user-avatar"
              onClick={() => navigate('/settings')}
            />
          ) : (
            <div 
              className="user-avatar"
              onClick={() => navigate('/settings')}
              style={{
                backgroundColor: 'var(--custom-accent)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 500,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

