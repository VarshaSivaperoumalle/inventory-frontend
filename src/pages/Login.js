import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const handleLogin = () => {
    if (!username || !password) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          background: #f7f8fc;
          font-family: 'DM Sans', sans-serif;
        }

        /* Left panel */
        .login-left {
          width: 420px;
          flex-shrink: 0;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 44px;
          box-shadow: 4px 0 24px rgba(0,0,0,0.05);
          position: relative;
          z-index: 1;
        }

        /* Right decorative panel */
        .login-right {
          flex: 1;
          background: linear-gradient(135deg, #FF7A00 0%, #ffb347 60%, #ffd49a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 700px) { .login-right { display: none; } .login-left { width: 100%; } }

        .login-right-pattern {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .login-right-content {
          position: relative;
          text-align: center;
          color: #fff;
          padding: 40px;
        }
        .right-icon {
          font-size: 72px;
          margin-bottom: 20px;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.15));
        }
        .right-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 32px;
          margin-bottom: 10px;
          line-height: 1.15;
        }
        .right-sub {
          font-size: 15px;
          opacity: 0.85;
          line-height: 1.5;
          max-width: 280px;
          margin: 0 auto;
        }
        .right-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 30px;
          padding: 8px 18px;
          background: rgba(255,255,255,0.22);
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Brand */
        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }
        .login-logo {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #FF7A00, #ffb347);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(255,122,0,0.3);
        }
        .login-logo svg { width: 22px; height: 22px; }
        .login-app-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 17px;
          color: #1a1a2e;
          line-height: 1.1;
        }
        .login-app-sub {
          font-size: 10px;
          color: #FF7A00;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .login-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 26px;
          color: #1a1a2e;
          margin-bottom: 4px;
        }
        .login-subheading {
          font-size: 13px;
          color: #aaa;
          margin-bottom: 30px;
          font-weight: 400;
        }

        /* Fields */
        .field { margin-bottom: 16px; }
        .field label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 7px;
          transition: color 0.2s;
        }
        .field.focused label { color: #FF7A00; }

        .input-wrap { position: relative; }
        .input-icon {
          position: absolute;
          left: 13px; top: 50%;
          transform: translateY(-50%);
          font-size: 15px;
          pointer-events: none;
          color: #ccc;
          transition: color 0.2s;
        }
        .field.focused .input-icon { color: #FF7A00; }

        .field input {
          width: 100%;
          border: 1.5px solid #ebebeb;
          background: #fafafa;
          border-radius: 10px;
          padding: 12px 14px 12px 40px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #1a1a2e;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field input::placeholder { color: #ccc; }
        .field input:focus {
          border-color: #FF7A00;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(255,122,0,0.1);
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .shake .field input { animation: shake 0.4s ease; border-color: #ef4444; }

        /* Button */
        .login-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #FF7A00, #ffb347);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 6px;
          box-shadow: 0 4px 18px rgba(255,122,0,0.35);
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          position: relative;
          overflow: hidden;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(255,122,0,0.45);
        }
        .login-btn:active:not(:disabled) { transform: translateY(1px); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 7px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          font-size: 12px;
        }
        .login-footer a { color: #FF7A00; text-decoration: none; }
        .login-footer a:hover { text-decoration: underline; }
        .secure { color: #bbb; display: flex; align-items: center; gap: 5px; }
        .sdot {
          width: 6px; height: 6px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 5px #22c55e;
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* mount animation */
        .login-left {
          opacity: 0;
          transform: translateX(-20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .login-left.mounted { opacity: 1; transform: translateX(0); }
        .login-right {
          opacity: 0;
          transition: opacity 0.8s 0.2s ease;
        }
        .login-right.mounted { opacity: 1; }
      `}</style>

      <div className="login-root">
        <div className={`login-left ${mounted ? "mounted" : ""}`}>
          {/* Brand */}
          <div className="login-brand">
            <div className="login-logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="8" width="18" height="13" rx="2" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.6"/>
                <path d="M8 8V6a4 4 0 018 0v2" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="12" cy="14" r="2" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="login-app-name">InvenTrack</div>
              <div className="login-app-sub">Pro</div>
            </div>
          </div>

          <div className="login-heading">Welcome back 👋</div>
          <div className="login-subheading">Sign in to your account to continue</div>

          <div className={shake ? "shake" : ""}>
            <div className={`field ${focused === "user" ? "focused" : ""}`}>
              <label>Username</label>
              <div className="input-wrap">
                <span className="input-icon">👤</span>
                <input
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={() => setFocused("user")}
                  onBlur={() => setFocused(null)}
                />
              </div>
            </div>

            <div className={`field ${focused === "pass" ? "focused" : ""}`}>
              <label>Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("pass")}
                  onBlur={() => setFocused(null)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>
          </div>

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? <><span className="spinner" />Signing in…</> : "Sign In →"}
          </button>

          <div className="login-footer">
            <a href="#">Forgot password?</a>
            <div className="secure"><div className="sdot" /> SSL Secured</div>
          </div>
        </div>

        <div className={`login-right ${mounted ? "mounted" : ""}`}>
          <div className="login-right-pattern" />
          <div className="login-right-content">
            <div className="right-icon">📦</div>
            <div className="right-title">Smart Inventory<br />Management</div>
            <div className="right-sub">Track stock, get restock alerts, and manage your inventory all in one place.</div>
            <div className="right-pill">✅ Trusted by 500+ businesses</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;