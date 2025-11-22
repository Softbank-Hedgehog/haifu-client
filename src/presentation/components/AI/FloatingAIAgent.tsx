import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const FloatingAIAgent: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; content: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // 16rem = 256px
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 48; 
      const maxWidth = 432; 
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
        if (newWidth <= minWidth + 10) {
          setIsCollapsed(true);
        } else {
          setIsCollapsed(false);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setSidebarWidth(48);
    } else {
      setSidebarWidth(384);
    }
  };

  const getContextualMessage = () => {
    const path = location.pathname;
    if (path.includes('/projects/') && path.includes('/resources/')) {
      return 'I can help you analyze deployment logs, suggest optimizations, or troubleshoot issues.';
    }
    if (path.includes('/projects/new') || path.includes('/resources/new')) {
      return 'I can help you configure your project or service deployment with optimal settings.';
    }
    if (path.includes('/projects/')) {
      return 'I can help you manage services and suggest deployment strategies.';
    }
    return 'I can help you with project management, deployment strategies, and troubleshooting.';
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user' as const, content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // TODO: 실제 AI API 호출
    setTimeout(() => {
      const agentMessage = {
        role: 'agent' as const,
        content: 'This is a placeholder response. AI integration will be implemented here.',
      };
      setMessages((prev) => [...prev, agentMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside 
      ref={sidebarRef}
      className={`ai-agent-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{ width: `${sidebarWidth}px` }}
      onClick={(e) => {
        // 패널 내부 클릭 시 이벤트 전파 중지
        e.stopPropagation();
      }}
    >
      <div 
        ref={resizerRef}
        className={`ai-agent-resizer ${isResizing ? 'resizing' : ''}`}
        onMouseDown={handleMouseDown}
      />
      <button 
        className="ai-sidebar-toggle-btn"
        onClick={toggleCollapse}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className="material-symbols-outlined">
          chevron_right
        </span>
      </button>
      <div className="ai-agent-header">
        <div className="ai-agent-title">
          <span className="material-symbols-outlined">auto_awesome</span>
          <h3>AI Assistant</h3>
        </div>
      </div>

      <div className="ai-agent-content">
        <div className="ai-agent-content-wrapper">
          {/* Chat Messages */}
          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-message-placeholder">
                <div className="ai-welcome-message">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <h4>AI Assistant</h4>
                  <p>{getContextualMessage()}</p>
                  <div className="ai-quick-actions">
                    <button 
                      className="ai-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const message = 'Help me configure my deployment';
                        const userMessage = { role: 'user' as const, content: message };
                        setMessages((prev) => [...prev, userMessage]);
                        
                        // TODO: 실제 AI API 호출
                        setTimeout(() => {
                          const agentMessage = {
                            role: 'agent' as const,
                            content: 'I\'ll help you configure your deployment. What specific aspects would you like to configure?',
                          };
                          setMessages((prev) => [...prev, agentMessage]);
                        }, 500);
                      }}
                    >
                      Help me configure
                    </button>
                    <button 
                      className="ai-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const message = 'Analyze my deployment logs';
                        const userMessage = { role: 'user' as const, content: message };
                        setMessages((prev) => [...prev, userMessage]);
                        
                        // TODO: 실제 AI API 호출
                        setTimeout(() => {
                          const agentMessage = {
                            role: 'agent' as const,
                            content: 'I\'ll analyze your deployment logs. Let me check the recent logs and identify any issues.',
                          };
                          setMessages((prev) => [...prev, agentMessage]);
                        }, 500);
                      }}
                    >
                      Analyze logs
                    </button>
                    <button 
                      className="ai-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const message = 'Optimize my settings';
                        const userMessage = { role: 'user' as const, content: message };
                        setMessages((prev) => [...prev, userMessage]);
                        
                        // TODO: 실제 AI API 호출
                        setTimeout(() => {
                          const agentMessage = {
                            role: 'agent' as const,
                            content: 'I\'ll help you optimize your settings. Let me analyze your current configuration and suggest improvements.',
                          };
                          setMessages((prev) => [...prev, agentMessage]);
                        }, 500);
                      }}
                    >
                      Optimize settings
                    </button>
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-message ai-message-${msg.role}`}>
                <div className="ai-message-avatar">
                  {msg.role === 'agent' ? (
                    <span className="material-symbols-outlined">auto_awesome</span>
                  ) : (
                    <span className="material-symbols-outlined">person</span>
                  )}
                </div>
                <div className="ai-message-content-wrapper">
                  <div className="ai-message-content">{msg.content}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="ai-input-container">
          <input
            type="text"
            className="ai-input"
            placeholder="Ask Agent Anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="ai-send-btn" 
            onClick={(e) => {
              e.stopPropagation();
              handleSend();
            }}
            disabled={!inputValue.trim()}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
      {/* 접혔을 때 하단에 보이는 토글 버튼 */}
      {isCollapsed && (
        <button 
          className="ai-sidebar-toggle-btn-bottom"
          onClick={toggleCollapse}
          aria-label="Expand sidebar"
        >
          <span className="material-symbols-outlined">side_navigation</span>
        </button>
      )}
    </aside>
  );
};

export default FloatingAIAgent;

