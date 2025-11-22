import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDependencies } from '../context/DependencyContext';
import { ResourceUseCase } from '../../application/useCases/ResourceUseCase';
import type { Resource } from '../../domain/entities/Resource';
import MainLayout from '../components/Layout/MainLayout';

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

const AIChatPage: React.FC = () => {
  const { projectId, resourceId } = useParams<{ projectId: string; resourceId: string }>();
  const navigate = useNavigate();
  const { resourceRepository } = useDependencies();
  const resourceUseCase = new ResourceUseCase(resourceRepository);
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'agent',
      content: `Hello! I'm your AI assistant for ${resourceId || 'this service'}. I can help you analyze logs, troubleshoot issues, suggest optimizations, or assist with redeployment. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resourceId) {
      loadResource();
    }
  }, [resourceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadResource = async () => {
    if (!resourceId || !projectId) return;
    try {
      setLoading(true);
      const data = await resourceUseCase.getResource(resourceId, projectId);
      setResource(data.resource);
    } catch (error) {
      console.error('Failed to load resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSending(true);

    // TODO: 실제 AI API 호출
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        role: 'agent',
        content: 'This is a placeholder response. AI integration will be implemented here to analyze logs, provide recommendations, and assist with deployment issues.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
      setSending(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    const quickMessages: Record<string, string> = {
      analyze: 'Please analyze the current deployment logs and identify any issues.',
      optimize: 'Can you suggest optimizations for this service?',
      redeploy: 'I want to redeploy this service. What steps should I take?',
      troubleshoot: 'Help me troubleshoot any errors in the deployment.',
    };

    if (quickMessages[action]) {
      setInputValue(quickMessages[action]);
    }
  };

  if (loading || !resource) {
    return (
      <MainLayout>
        <div className="loading">Loading AI chat...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="ai-chat-page">
        <div className="page-header">
          <button onClick={() => navigate(`/projects/${projectId}/resources/${resourceId}`)} className="back-btn">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="page-title-section">
            <h1>AI Chat</h1>
            <p className="page-subtitle">{resource.name} - AI-powered analysis and assistance</p>
          </div>
        </div>

        <div className="chat-container">
          {/* 로그 검색 필터 */}
          <div className="log-filter-section">
            <div className="filter-header">
              <span className="material-symbols-outlined">filter_list</span>
              <h3>Log Search Filter</h3>
            </div>
            <div className="filter-controls">
              <input
                type="text"
                className="filter-input"
                placeholder="Search logs by keyword..."
              />
              <select className="filter-select">
                <option value="all">All Log Levels</option>
                <option value="error">Errors Only</option>
                <option value="warning">Warnings</option>
                <option value="info">Info</option>
              </select>
              <button className="btn btn-secondary">
                <span className="material-symbols-outlined">search</span>
                Search Logs
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              className="quick-action-btn"
              onClick={() => handleQuickAction('analyze')}
            >
              <span className="material-symbols-outlined">psychology</span>
              Analyze Logs
            </button>
            <button
              className="quick-action-btn"
              onClick={() => handleQuickAction('optimize')}
            >
              <span className="material-symbols-outlined">tune</span>
              Optimize
            </button>
            <button
              className="quick-action-btn"
              onClick={() => handleQuickAction('troubleshoot')}
            >
              <span className="material-symbols-outlined">build</span>
              Troubleshoot
            </button>
            <button
              className="quick-action-btn"
              onClick={() => handleQuickAction('redeploy')}
            >
              <span className="material-symbols-outlined">refresh</span>
              Re-deploy
            </button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message chat-message-${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'agent' ? (
                    <span className="material-symbols-outlined">auto_awesome</span>
                  ) : (
                    <span className="material-symbols-outlined">person</span>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.content}</div>
                  <div className="message-timestamp">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {sending && (
              <div className="chat-message chat-message-agent">
                <div className="message-avatar">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div className="message-content">
                  <div className="message-text">
                    <span className="material-symbols-outlined spin">sync</span>
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask Agent Anything... (e.g., analyze logs, troubleshoot errors, optimize deployment)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim() || sending}
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>

          {/* 추천 코드 스니펫 */}
          {/* todo: database의 resource의 정보를 가져오기*/}
          <div className="code-snippets">
            <h4>Recommended Code Snippets</h4>
            <div className="snippets-list">
              <div className="code-snippet">
                <pre>{`// Fix deployment issue
npm run build
npm run deploy`}</pre>
              </div>
            </div>
          </div>

          {/* 재배포 버튼 */}
          <div className="chat-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/projects/${projectId}/resources/${resourceId}/redeploy`)}
            >
              <span className="material-symbols-outlined">refresh</span>
              Re-deploy Service
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIChatPage;

