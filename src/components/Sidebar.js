import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/profile",   icon: "👤", label: "Profile"   },
];

function Sidebar() {
  const location = useLocation();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .sb {
          width: 230px;
          min-height: 100vh;
          background: #fff;
          border-right: 1px solid #ebebeb;
          display: flex;
          flex-direction: column;
          padding: 24px 14px;
          font-family: 'DM Sans', sans-serif;
          flex-shrink: 0;
          box-shadow: 2px 0 16px rgba(0,0,0,0.04);
        }

        .sb-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
          padding: 0 6px;
        }
        .sb-logo {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #FF7A00 0%, #ffb347 100%);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(255,122,0,0.35);
          flex-shrink: 0;
        }
        .sb-logo svg { width: 22px; height: 22px; }
        .sb-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 15px;
          color: #1a1a2e;
          line-height: 1.1;
        }
        .sb-pro {
          display: inline-block;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #FF7A00;
        }

        .sb-section {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c5c5c5;
          padding: 0 10px;
          margin-bottom: 6px;
        }

        .sb-link {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: #999;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 2px;
          position: relative;
          transition: all 0.18s;
        }
        .sb-link:hover { color: #FF7A00; background: #fff7f0; }
        .sb-link.active {
          color: #FF7A00;
          background: #fff3e8;
          font-weight: 600;
        }
        .sb-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 22%; bottom: 22%;
          width: 3px;
          background: #FF7A00;
          border-radius: 0 3px 3px 0;
        }
        .sb-link-icon { font-size: 14px; }

        .sb-spacer { flex: 1; }

        .sb-user {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 12px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 10px;
        }
        .sb-av {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #FF7A00, #ffb347);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 13px;
          color: #fff;
          flex-shrink: 0;
        }
        .sb-uname { font-size: 12px; font-weight: 600; color: #1a1a2e; }
        .sb-urole { font-size: 10px; color: #bbb; }
      `}</style>

      <div className="sb">
        <div className="sb-brand">
          <div className="sb-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="8" width="18" height="13" rx="2" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.6"/>
              <path d="M8 8V6a4 4 0 018 0v2" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="12" cy="14" r="2" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="sb-name">InvenTrack</div>
            <div className="sb-pro">Pro</div>
          </div>
        </div>

        <div className="sb-section">Menu</div>
        {navItems.map(({ to, icon, label }) => (
          <Link key={to} to={to} className={`sb-link ${location.pathname === to ? "active" : ""}`}>
            <span className="sb-link-icon">{icon}</span>
            {label}
          </Link>
        ))}

        <div className="sb-spacer" />

        <div className="sb-user">
          <div className="sb-av">V</div>
          <div>
            <div className="sb-uname">Varsha</div>
            <div className="sb-urole">Administrator</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;