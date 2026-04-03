import { useState, useRef, useEffect } from "react";
import axios from "axios";

const BRAND = "#FF7A00";
const BRAND_DARK = "#E06500";
const BRAND_LIGHT = "#FFF3E8";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([
    { bot: "Hi there! 👋 I'm your Inventory Assistant. Ask me anything about stock, orders, or products." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    const userMsg = msg.trim();
    setMsg("");
    setChat(prev => [...prev, { user: userMsg }]);
    setIsTyping(true);

    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", { message: userMsg });
      setIsTyping(false);
      setChat(prev => [
        ...prev,
        { bot: res.data.answer || JSON.stringify(res.data) }
      ]);
    } catch {
      setIsTyping(false);
      setChat(prev => [
        ...prev,
        { bot: "Sorry, I couldn't connect to the server. Please try again." }
      ]);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleOpen = () => {
    setIsOpen(o => !o);
    setIsMinimized(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .cb-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${BRAND}, ${BRAND_DARK});
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(255,122,0,0.45), 0 1px 4px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s;
          outline: none;
        }
        .cb-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(255,122,0,0.55), 0 2px 6px rgba(0,0,0,0.18);
        }
        .cb-fab:active { transform: scale(0.96); }

        .cb-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 18px;
          height: 18px;
          background: #22C55E;
          border: 2px solid #fff;
          border-radius: 50%;
          font-size: 9px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }

        .cb-window {
          position: fixed;
          bottom: 100px;
          right: 28px;
          width: 360px;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 12px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
          z-index: 9999;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          transform-origin: bottom right;
          transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), opacity 0.25s ease;
          border: 1px solid rgba(255,122,0,0.12);
        }
        .cb-window.open {
          transform: scale(1) translateY(0);
          opacity: 1;
          pointer-events: all;
        }
        .cb-window.closed {
          transform: scale(0.7) translateY(30px);
          opacity: 0;
          pointer-events: none;
        }
        .cb-window.minimized {
          transform: scale(1) translateY(0);
          opacity: 1;
          pointer-events: all;
        }

        .cb-header {
          background: linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%);
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }
        .cb-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.35);
        }
        .cb-header-info { flex: 1; }
        .cb-header-name {
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.2px;
          line-height: 1.2;
        }
        .cb-header-status {
          color: rgba(255,255,255,0.8);
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 2px;
        }
        .cb-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #86EFAC;
          display: inline-block;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .cb-header-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .cb-icon-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: none;
          background: rgba(255,255,255,0.15);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
          font-size: 16px;
          line-height: 1;
        }
        .cb-icon-btn:hover { background: rgba(255,255,255,0.28); }

        .cb-body {
          height: 300px;
          overflow-y: auto;
          padding: 18px 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #FAFAFA;
          transition: height 0.3s cubic-bezier(.4,0,.2,1);
          scrollbar-width: thin;
          scrollbar-color: #e0e0e0 transparent;
        }
        .cb-body.minimized { height: 0; padding: 0; }
        .cb-body::-webkit-scrollbar { width: 4px; }
        .cb-body::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }

        .cb-bubble-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: fadeUp 0.25s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cb-bubble-row.user { flex-direction: row-reverse; }

        .cb-mini-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${BRAND}, ${BRAND_DARK});
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
          border: 1.5px solid rgba(255,122,0,0.2);
        }

        .cb-bubble {
          max-width: 78%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.55;
          color: #1a1a1a;
        }
        .cb-bubble.bot {
          background: #fff;
          border-radius: 4px 16px 16px 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          border: 1px solid #f0f0f0;
        }
        .cb-bubble.user {
          background: linear-gradient(135deg, ${BRAND}, ${BRAND_DARK});
          color: #fff;
          border-radius: 16px 4px 16px 16px;
        }

        .cb-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 14px;
          background: #fff;
          border-radius: 4px 16px 16px 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          border: 1px solid #f0f0f0;
          width: fit-content;
        }
        .cb-typing span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${BRAND};
          animation: bounce 1.2s infinite;
          opacity: 0.7;
        }
        .cb-typing span:nth-child(2) { animation-delay: 0.18s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.36s; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }

        .cb-footer {
          padding: 12px 14px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          gap: 8px;
          align-items: center;
          background: #fff;
          transition: padding 0.3s, opacity 0.3s;
        }
        .cb-footer.minimized { padding: 0; opacity: 0; overflow: hidden; height: 0; }

        .cb-input {
          flex: 1;
          border: 1.5px solid #eee;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #1a1a1a;
          background: #FAFAFA;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          resize: none;
          height: 40px;
          line-height: 1.4;
        }
        .cb-input:focus {
          border-color: ${BRAND};
          box-shadow: 0 0 0 3px rgba(255,122,0,0.1);
          background: #fff;
        }
        .cb-input::placeholder { color: #bbb; }

        .cb-send {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, ${BRAND}, ${BRAND_DARK});
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(255,122,0,0.35);
        }
        .cb-send:hover { transform: scale(1.07); box-shadow: 0 4px 14px rgba(255,122,0,0.45); }
        .cb-send:active { transform: scale(0.95); }
        .cb-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .cb-powered {
          text-align: center;
          font-size: 10.5px;
          color: #ccc;
          padding: 6px 0 8px;
          background: #fff;
          letter-spacing: 0.3px;
          transition: padding 0.3s, opacity 0.3s;
        }
        .cb-powered.minimized { padding: 0; opacity: 0; height: 0; overflow: hidden; }
      `}</style>

      {/* Chat Window */}
      <div className={`cb-window ${isOpen ? (isMinimized ? "minimized" : "open") : "closed"}`}>
        {/* Header */}
        <div className="cb-header">
          <div className="cb-avatar">🤖</div>
          <div className="cb-header-info">
            <div className="cb-header-name">Inventory Assistant</div>
            <div className="cb-header-status">
              <span className="cb-status-dot" />
              Online & ready
            </div>
          </div>
          <div className="cb-header-actions">
            <button
              className="cb-icon-btn"
              onClick={() => setIsMinimized(m => !m)}
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? "▲" : "▼"}
            </button>
            <button
              className="cb-icon-btn"
              onClick={toggleOpen}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`cb-body${isMinimized ? " minimized" : ""}`}>
          {chat.map((c, i) => (
            <div key={i}>
              {c.bot && (
                <div className="cb-bubble-row bot">
                  <div className="cb-mini-avatar">🤖</div>
                  <div className="cb-bubble bot">{c.bot}</div>
                </div>
              )}
              {c.user && (
                <div className="cb-bubble-row user">
                  <div className="cb-bubble user">{c.user}</div>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="cb-bubble-row bot">
              <div className="cb-mini-avatar">🤖</div>
              <div className="cb-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className={`cb-footer${isMinimized ? " minimized" : ""}`}>
          <input
            ref={inputRef}
            className="cb-input"
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about inventory…"
          />
          <button
            className="cb-send"
            onClick={sendMessage}
            disabled={!msg.trim()}
            title="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={`cb-powered${isMinimized ? " minimized" : ""}`}>
          Powered by Inventory AI
        </div>
      </div>

      {/* FAB Trigger Button */}
      <button className="cb-fab" onClick={toggleOpen} title="Chat with Assistant">
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {!isOpen && <div className="cb-badge">1</div>}
      </button>
    </>
  );
}