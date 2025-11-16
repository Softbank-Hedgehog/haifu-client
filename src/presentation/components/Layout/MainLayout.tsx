import React, { type ReactNode, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import TopBar from './TopBar';
import FloatingAIAgent from '../AI/FloatingAIAgent';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const showAIAgent = useMemo(
    () => !location.pathname.includes('/login') && !location.pathname.includes('/callback'),
    [location.pathname]
  );

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="main-layout">
      <LeftSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar}
        onCollapseChange={setIsSidebarCollapsed}
      />
      <div className="main-content-wrapper">
        <TopBar />
        <main className="main-content">{children}</main>
      </div>
      {showAIAgent && <FloatingAIAgent key="ai-agent" />}
    </div>
  );
};

export default MainLayout;

