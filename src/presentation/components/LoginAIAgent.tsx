import React, { useState, useRef, useEffect } from 'react';

const LoginAIAgent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const agentButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (panelRef.current && panelRef.current.contains(target)) ||
        (agentButtonRef.current && agentButtonRef.current.contains(target))
      ) {
        return;
      }
      setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handler);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  const handleSend = () => {
    if (!input.trim()) return;
    setInput('');
  };

  return (
    <div className="login-ai-wrapper">
      {open && (
        <div ref={panelRef} className="login-ai-bubble">
          <div className="login-ai-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="material-symbols-outlined">psychology</span>
              hAIfu Agent
            </span>
            <button
              aria-label="Close agent panel"
              onClick={() => setOpen(false)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#a7a7ad',
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                close
              </span>
            </button>
          </div>
          <div className="login-ai-body">
            <div className="login-ai-message login-ai-message-agent">
              <p style={{ margin: 0, fontSize: '0.75rem' }}>
                Hello! How can I help you with hAIfu&apos;s AI-powered deployment services today?
              </p>
            </div>
            <div className="login-ai-message login-ai-message-user">
              <p style={{ margin: 0, fontSize: '0.75rem' }}>How do I connect my repo?</p>
            </div>
          </div>
          <div className="login-ai-input-wrapper">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="login-ai-input"
            />
            <button
              onClick={handleSend}
              className="login-ai-send"
              disabled={!input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        aria-label="Open AI agent"
        className={`login-ai-button ${open ? 'login-ai-button-open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        ref={agentButtonRef}
      >
        <span className="material-symbols-outlined login-ai-button-icon">
          psychology
        </span>
      </button>
    </div>
  );
};

export default LoginAIAgent;

