import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useDependencies } from '../../context/DependencyContext';
import { RepositoryUseCase } from '../../../application/useCases/RepositoryUseCase';

const FloatingAIAgent: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; content: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // 16rem = 256px
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  
  const { repositoryRepository } = useDependencies();
  const repositoryUseCase = useMemo(() => new RepositoryUseCase(repositoryRepository), [repositoryRepository]);

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

  const sendMessage = async (message: string) => {
    if (!message.trim() || sending) return;

    const userMessage = { role: 'user' as const, content: message };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      // 실제 Chat API 호출
      const response = await repositoryUseCase.sendChatMessage({ message: message.trim() });
      
      const agentMessage = {
        role: 'agent' as const,
        content: response.reply || 'I apologize, but I couldn\'t generate a response. Please try again.',
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error: any) {
      console.error('[FloatingAIAgent] Failed to send chat message:', error);
      const errorMessage = {
        role: 'agent' as const,
        content: `Error: ${error.message || 'Failed to get response. Please try again.'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    const messageToSend = inputValue.trim();
    setInputValue('');
    await sendMessage(messageToSend);
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
                        sendMessage('Help me configure my deployment');
                      }}
                      disabled={sending}
                    >
                      Help me configure
                    </button>
                    <button 
                      className="ai-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendMessage('Analyze my deployment logs');
                      }}
                      disabled={sending}
                    >
                      Analyze logs
                    </button>
                    <button 
                      className="ai-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendMessage('Optimize my settings');
                      }}
                      disabled={sending}
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
            placeholder={sending ? 'Sending...' : 'Ask Agent Anything...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
          />
          <button 
            className="ai-send-btn" 
            onClick={(e) => {
              e.stopPropagation();
              handleSend();
            }}
            disabled={!inputValue.trim() || sending}
          >
            <span className={`material-symbols-outlined ${sending ? 'spin' : ''}`}>
              {sending ? 'sync' : 'send'}
            </span>
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

