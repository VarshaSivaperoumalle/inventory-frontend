import { useState } from "react";
import Sidebar from "../components/Sidebar";

function Profile() {
  const [mounted] = useState(true);
  const [editing, setEditing] = useState(false);

  const stats = [
    { label: "Items Managed", value: "1,240", icon: "📦", bg: "#fff3e8", col: "#FF7A00" },
    { label: "Orders Placed",  value: "87",    icon: "🛒", bg: "#e8f1ff", col: "#3b82f6" },
    { label: "Alerts Resolved",value: "34",    icon: "✅", bg: "#edfaf3", col: "#22c55e" },
  ];

  const activity = [
    { action: "Updated stock for Electronics", time: "2 hours ago",  dot: "#FF7A00" },
    { action: "Resolved low-stock alert",      time: "Yesterday",    dot: "#22c55e" },
    { action: "Added 12 new products",         time: "2 days ago",   dot: "#3b82f6" },
    { action: "Exported inventory report",     time: "Last week",    dot: "#a78bfa" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f7f8fc; }

        .prof-root { display: flex; min-height: 100vh; background: #f7f8fc; font-family: 'DM Sans', sans-serif; color: #1a1a2e; }

        .prof-main {
          flex: 1; padding: 28px 26px; min-width: 0;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .prof-main.mounted { opacity: 1; transform: translateY(0); }

        .prof-heading { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #1a1a2e; margin-bottom: 3px; }
        .prof-heading span { color: #FF7A00; }
        .prof-sub { font-size: 13px; color: #aaa; margin-bottom: 26px; }

        /* ── Base button reset ── */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          line-height: 1;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          transition: background 0.18s, border-color 0.18s, color 0.18s,
                      transform 0.14s, box-shadow 0.18s, opacity 0.18s;
          /* prevent shrinking in flex parents */
          flex-shrink: 0;
        }

        /* active press feedback for ALL buttons */
        .btn:active { transform: scale(0.95); }
        .btn:disabled { opacity: 0.5; pointer-events: none; }
        .btn:focus-visible {
          outline: 2px solid #FF7A00;
          outline-offset: 2px;
        }

        /* ── Edit Profile button ── */
        .btn-edit {
          padding: 9px 18px;
          background: #fff3e8;
          border: 1.5px solid #ffd4a8;
          color: #FF7A00;
          border-radius: 9px;
          font-size: 13px;
          /* on small screens stretch full width */
        }
        .btn-edit:hover { background: #ffe8d0; border-color: #ffbb75; box-shadow: 0 2px 8px rgba(255,122,0,0.15); }
        .btn-edit.active { background: #ffe0c4; border-color: #FF7A00; }

        /* ── Save / Cancel (shown when editing) ── */
        .btn-save {
          padding: 9px 18px;
          background: #FF7A00;
          color: #fff;
          border-radius: 9px;
          font-size: 13px;
          border: 1.5px solid #FF7A00;
        }
        .btn-save:hover { background: #e66e00; box-shadow: 0 4px 14px rgba(255,122,0,0.3); }

        .btn-cancel {
          padding: 9px 16px;
          background: #f5f5f5;
          color: #888;
          border-radius: 9px;
          font-size: 13px;
          border: 1.5px solid #e8e8e8;
        }
        .btn-cancel:hover { background: #ececec; color: #555; }

        /* ── Hero ── */
        .hero-card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 14px;
          padding: 26px;
          display: flex; align-items: center; gap: 22px; flex-wrap: wrap;
          margin-bottom: 18px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          animation: fadeUp 0.4s ease both;
          position: relative; overflow: hidden;
        }
        .hero-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #FF7A00, #ffb347 60%, transparent);
        }

        .avatar-ring {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A00, #ffb347);
          padding: 2.5px; flex-shrink: 0;
        }
        .avatar-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #FF7A00;
        }

        .hero-info { flex: 1; min-width: 150px; }
        .hero-name { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #1a1a2e; }
        .hero-role {
          display: inline-flex; align-items: center; gap: 4px;
          margin-top: 5px; padding: 3px 10px;
          background: #fff3e8; color: #FF7A00;
          font-size: 11px; font-weight: 600; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .hero-meta { margin-top: 10px; display: flex; gap: 16px; flex-wrap: wrap; }
        .hero-meta-item { font-size: 12px; color: #aaa; display: flex; align-items: center; gap: 4px; }

        /* button group in hero */
        .hero-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        /* ── Stats ── */
        .stat-row {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 14px; margin-bottom: 18px;
          animation: fadeUp 0.4s 0.1s ease both;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 12px; padding: 18px;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .stat-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #1a1a2e; }
        .stat-lbl { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 1px; }

        /* ── Two col ── */
        .two-col {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
          animation: fadeUp 0.4s 0.15s ease both;
        }

        .panel {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 12px; padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .panel-title {
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          color: #1a1a2e; margin-bottom: 16px;
        }

        .info-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 9px 0; border-bottom: 1px solid #f5f5f5;
        }
        .info-row:last-child { border-bottom: none; }
        .info-key { font-size: 11px; color: #bbb; text-transform: uppercase; letter-spacing: 0.06em; }
        .info-val { font-size: 13px; color: #444; font-weight: 500; }

        .act-row { display: flex; gap: 11px; padding: 9px 0; border-bottom: 1px solid #f5f5f5; align-items: flex-start; }
        .act-row:last-child { border-bottom: none; }
        .act-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
        .act-action { font-size: 12px; color: #555; }
        .act-time   { font-size: 10px; color: #bbb; margin-top: 2px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive breakpoints ── */

        /* Tablet */
        @media (max-width: 768px) {
          .prof-main { padding: 20px 16px; }

          .hero-card { padding: 20px; gap: 16px; }

          /* stack avatar row and actions */
          .hero-actions {
            width: 100%;
            justify-content: flex-start;
          }

          /* buttons take equal share */
          .hero-actions .btn {
            flex: 1;
            min-width: 0;
          }

          .two-col { grid-template-columns: 1fr; }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .stat-row { grid-template-columns: 1fr; }

          .hero-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-actions {
            flex-direction: column;
            width: 100%;
          }

          /* full-width buttons on mobile */
          .hero-actions .btn {
            width: 100%;
            padding: 12px 16px;
            font-size: 14px;
            justify-content: center;
          }

          .prof-heading { font-size: 20px; }
        }

        /* Very small (320 px phones) */
        @media (max-width: 360px) {
          .prof-main { padding: 14px 10px; }
          .stat-card { padding: 14px; }
          .panel { padding: 14px; }
        }
      `}</style>

      <div className="prof-root">
        <Sidebar />

        <div className={`prof-main ${mounted ? "mounted" : ""}`}>

          <div className="prof-heading">My <span>Profile</span></div>
          <div className="prof-sub">Manage your account and activity</div>

          {/* Hero */}
          <div className="hero-card">
            <div className="avatar-ring">
              <div className="avatar-inner">V</div>
            </div>

            <div className="hero-info">
              <div className="hero-name">Varsha</div>
              <div className="hero-role">⚡ Admin</div>
              <div className="hero-meta">
                <div className="hero-meta-item">📍 Chennai, IN</div>
                <div className="hero-meta-item">🟢 Active now</div>
              </div>
            </div>

            <div className="hero-actions">
              {editing ? (
                <>
                  <button
                    className="btn btn-save"
                    onClick={() => setEditing(false)}
                    aria-label="Save profile changes"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    className="btn btn-cancel"
                    onClick={() => setEditing(false)}
                    aria-label="Cancel editing"
                  >
                    ✕ Cancel
                  </button>
                </>
              ) : (
                <button
                  className={`btn btn-edit ${editing ? "active" : ""}`}
                  onClick={() => setEditing(true)}
                  aria-label="Edit profile"
                >
                  ✏ Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="stat-row">
            {stats.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div className="stat-val" style={{ color: s.col }}>{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Details + Activity */}
          <div className="two-col">
            <div className="panel">
              <div className="panel-title">Account Details</div>
              {[
                ["Full Name",  "Varsha"              ],
                ["Role",       "Administrator"        ],
                ["Email",      "varsha@inventrack.app"],
                ["Joined",     "January 2024"         ],
                ["Last Login", "Today, 9:42 AM"       ],
                ["Status",     "✅ Active"            ],
              ].map(([k, v]) => (
                <div className="info-row" key={k}>
                  <div className="info-key">{k}</div>
                  <div className="info-val">{v}</div>
                </div>
              ))}
            </div>

            <div className="panel">
              <div className="panel-title">Recent Activity</div>
              {activity.map((a, i) => (
                <div className="act-row" key={i}>
                  <div className="act-dot" style={{ background: a.dot }} />
                  <div>
                    <div className="act-action">{a.action}</div>
                    <div className="act-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Profile;