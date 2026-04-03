import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import Sidebar from "../components/Sidebar";
import Chatbot from "../components/Chatbot";

// ── Tiny CSV / PDF-like text export helpers (no extra deps) ──────────────────
function exportCSV(data) {
  const headers = ["#", "Product", "Category", "Quantity", "Price (₹)", "Value (₹)"];
  const rows = data.map((item, i) => [
    i + 1,
    `"${item.product_name}"`,
    `"${item.category}"`,
    item.quantity,
    item.price,
    (item.price * item.quantity).toFixed(2),
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventory_report_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(data, summary, lowStock) {
  const report = {
    generated_at: new Date().toISOString(),
    total_items: data.length,
    total_value: data.reduce((a, i) => a + i.price * i.quantity, 0).toFixed(2),
    low_stock_count: lowStock.length,
    category_summary: summary.map(s => ({ category: s[0], quantity: s[1] })),
    inventory: data,
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventory_report_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportHTMLReport(data, summary, lowStock) {
  const totalValue = data.reduce((a, i) => a + i.price * i.quantity, 0);
  const rows = data
    .map(
      (item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.product_name}</td>
        <td><span class="cat">${item.category}</span></td>
        <td>${item.quantity}</td>
        <td>₹${item.price}</td>
        <td>₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const lowRows = lowStock
    .map(
      item => `<tr><td>${item.product_name}</td><td class="danger">${item.quantity}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Inventory Report – ${new Date().toLocaleDateString()}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Mono',monospace;background:#0f0f11;color:#e8e4dc;padding:40px}
  h1{font-family:'Syne',sans-serif;font-size:2.4rem;font-weight:800;letter-spacing:-1px;color:#f5c842;margin-bottom:4px}
  .sub{color:#888;font-size:.85rem;margin-bottom:36px}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:36px}
  .stat{background:#1a1a1f;border:1px solid #2a2a32;border-radius:10px;padding:20px}
  .stat-val{font-size:1.8rem;font-weight:700;color:#f5c842;font-family:'Syne',sans-serif}
  .stat-lbl{font-size:.75rem;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:.08em}
  h2{font-family:'Syne',sans-serif;font-weight:700;margin-bottom:14px;color:#f5c842}
  table{width:100%;border-collapse:collapse;margin-bottom:36px}
  th{text-align:left;padding:10px 14px;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:#888;border-bottom:1px solid #2a2a32}
  td{padding:10px 14px;border-bottom:1px solid #1e1e24;font-size:.85rem}
  tr:last-child td{border-bottom:none}
  .cat{background:#1e1e28;color:#a78bfa;padding:2px 10px;border-radius:20px;font-size:.75rem}
  .danger{color:#f87171}
  .low-table{max-width:420px}
  @media print{body{background:#fff;color:#111} .stat{background:#f5f5f5;border:1px solid #ddd} h1,.stat-val{color:#c48b00} th{color:#555}}
</style>
</head>
<body>
<h1>Inventory Report</h1>
<p class="sub">Generated on ${new Date().toLocaleString()}</p>
<div class="stats">
  <div class="stat"><div class="stat-val">${data.length}</div><div class="stat-lbl">Total Items</div></div>
  <div class="stat"><div class="stat-val">${summary.length}</div><div class="stat-lbl">Categories</div></div>
  <div class="stat"><div class="stat-val">₹${totalValue.toLocaleString()}</div><div class="stat-lbl">Total Value</div></div>
  <div class="stat"><div class="stat-val">${lowStock.length}</div><div class="stat-lbl">Low Stock</div></div>
</div>
<h2>Full Inventory</h2>
<table><thead><tr><th>#</th><th>Product</th><th>Category</th><th>Qty</th><th>Price</th><th>Value</th></tr></thead><tbody>${rows}</tbody></table>
<h2>Low Stock Alert</h2>
<table class="low-table"><thead><tr><th>Product</th><th>Qty</th></tr></thead><tbody>${lowRows}</tbody></table>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventory_report_${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="stat-card" style={{ "--accent": accent }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [search, setSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const exportRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Close export dropdown on outside click
  useEffect(() => {
    function handle(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get("inventory-backend-production-6b10.up.railway.app/inventory"),
      axios.get("inventory-backend-production-6b10.up.railway.app/summary"),
      axios.get("inventory-backend-production-6b10.up.railway.app/low-stock"),
      axios.get("inventory-backend-production-6b10.up.railway.app/recommend"),
    ]).then(([inv, sum, ls, rec]) => {
      setData(inv.data);
      setSummary(sum.data);
      setLowStock(ls.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const filtered = data.filter(
    item =>
      item.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = data.reduce((acc, item) => acc + (item.price * item.quantity || 0), 0);

  const chartData = {
    labels: summary.map(i => i[0]),
    datasets: [
      {
        label: "Stock",
        data: summary.map(i => i[1]),
        backgroundColor: summary.map((_, idx) =>
          ["#FF7A00", "#ef4444", "#16a34a", "#3b82f6", "#7c3aed", "#f59e0b"][idx % 6]
        ),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#aaa", font: { family: "'DM Mono'" } } },
      y: { grid: { color: "#f0f1f5" }, ticks: { color: "#aaa", font: { family: "'DM Mono'" } } },
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f7f8fc;
          font-family: 'DM Mono', monospace;
          color: #1a1a2e;
        }

        /* ── Layout ── */
        .dash-root { display: flex; min-height: 100vh; }

        .dash-main {
          flex: 1;
          padding: 28px 32px;
          overflow-y: auto;
        }

        /* ── Header ── */
        .dash-header {
          position: sticky;
          top: 0;
          background: #f7f8fc;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          margin-bottom: 24px;
          border-bottom: 1px solid #e8eaf0;
        }

        .dash-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #FF7A00;
        }

        .dash-subtitle {
          font-size: 0.72rem;
          color: #aaa;
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .header-actions { display: flex; gap: 10px; align-items: center; }

        /* ── Buttons ── */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          border-radius: 8px;
          font-family: 'DM Mono', monospace;
          font-size: 0.78rem;
          cursor: pointer;
          border: none;
          transition: all 0.18s;
          font-weight: 500;
          white-space: nowrap;
        }

        .btn-ghost {
          background: #fff;
          color: #666;
          border: 1px solid #e0e2ea;
        }
        .btn-ghost:hover { background: #f0f1f5; color: #1a1a2e; border-color: #c8cad4; }

        .btn-primary {
          background: #FF7A00;
          color: #fff;
          font-weight: 700;
        }
        .btn-primary:hover { background: #e66e00; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,122,0,0.25); }

        /* ── Export Dropdown ── */
        .export-wrap { position: relative; }

        .export-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #fff;
          border: 1px solid #e8eaf0;
          border-radius: 10px;
          min-width: 200px;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,0.1);
          animation: menuIn 0.15s ease;
          z-index: 99;
        }

        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .export-menu-title {
          padding: 10px 16px 8px;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #aaa;
          border-bottom: 1px solid #f0f1f5;
        }

        .export-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          font-size: 0.82rem;
          cursor: pointer;
          transition: background 0.15s;
          color: #444;
        }
        .export-item:hover { background: #fff8f2; color: #FF7A00; }

        .export-item-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        /* ── Stats ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #e8eaf0;
          border-radius: 12px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--accent, #FF7A00);
          opacity: 0.9;
        }
        .stat-card:hover { transform: translateY(-3px); border-color: var(--accent, #FF7A00); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }

        .stat-icon {
          font-size: 1.4rem;
          margin-bottom: 12px;
          opacity: 0.85;
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: #1a1a2e;
          letter-spacing: -1px;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.7rem;
          color: #aaa;
          margin-top: 6px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* ── Grid ── */
        .grid-2 {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .panel {
          background: #fff;
          border: 1px solid #e8eaf0;
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .panel-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #aaa;
          margin-bottom: 16px;
        }

        /* ── Low Stock ── */
        .ls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 0;
          border-bottom: 1px solid #f5f5f8;
          font-size: 0.82rem;
        }
        .ls-row:last-child { border-bottom: none; }

        .badge {
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 500;
        }

        .badge-red { background: #fef2f2; color: #ef4444; }
        .badge-yellow { background: #fff8ec; color: #f59e0b; }

        /* ── Table Panel ── */
        .tbl-panel {
          background: #fff;
          border: 1px solid #e8eaf0;
          border-radius: 12px;
          padding: 22px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .tbl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .tbl-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: #1a1a2e;
        }

        .search-wrap {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #bbb;
          font-size: 13px;
          pointer-events: none;
        }

        .search-input {
          background: #f7f8fc;
          border: 1px solid #e0e2ea;
          color: #1a1a2e;
          border-radius: 8px;
          padding: 8px 12px 8px 34px;
          font-family: 'DM Mono', monospace;
          font-size: 0.78rem;
          width: 220px;
          transition: border-color 0.2s;
          outline: none;
        }
        .search-input:focus { border-color: #FF7A00; background: #fff; }
        .search-input::placeholder { color: #bbb; }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead th {
          text-align: left;
          padding: 10px 14px;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #aaa;
          border-bottom: 1px solid #f0f1f5;
          font-weight: 500;
        }

        tbody tr {
          transition: background 0.15s;
        }
        tbody tr:hover { background: #fafbff; }

        tbody td {
          padding: 11px 14px;
          font-size: 0.82rem;
          border-bottom: 1px solid #f5f5f8;
          color: #555;
        }
        tbody tr:last-child td { border-bottom: none; }

        .td-name { color: #1a1a2e; font-weight: 500; }
        .td-cat {
          display: inline-flex;
          align-items: center;
          background: #f3f0ff;
          color: #7c3aed;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
        }

        .qty-pill {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 500;
        }
        .qty-low { background: #fef2f2; color: #ef4444; }
        .qty-ok  { background: #f0fdf4; color: #16a34a; }

        /* ── Loading ── */
        .loading-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px;
          color: #aaa;
          font-size: 0.8rem;
        }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid #e8eaf0;
          border-top-color: #FF7A00;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f7f8fc; }
        ::-webkit-scrollbar-thumb { background: #e0e2ea; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #c8cad4; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .grid-2 { grid-template-columns: 1fr; }
          .dash-main { padding: 18px; }
        }
        @media (max-width: 600px) {
          .dash-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .tbl-header { flex-direction: column; align-items: flex-start; }
          .search-input { width: 100%; }
        }
      `}</style>

      <div className="dash-root">
        <Sidebar />

        <div className="dash-main">

          {/* ── Header ── */}
          <div className="dash-header">
            <div>
              <div className="dash-title">Inventory Dashboard</div>
              <div className="dash-subtitle">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>

            <div className="header-actions">
              <button className="btn btn-ghost" onClick={fetchData}>
                ↻ Refresh
              </button>

              {/* Export Dropdown */}
              <div className="export-wrap" ref={exportRef}>
                <button
                  className="btn btn-primary"
                  onClick={() => setExportOpen(v => !v)}
                >
                  ↓ Export Report ▾
                </button>

                {exportOpen && (
                  <div className="export-menu">
                    <div className="export-menu-title">Choose format</div>

                    <div
                      className="export-item"
                      onClick={() => { exportCSV(data); setExportOpen(false); }}
                    >
                      <div className="export-item-icon" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>📊</div>
                      CSV Spreadsheet
                    </div>

                    <div
                      className="export-item"
                      onClick={() => { exportJSON(data, summary, lowStock); setExportOpen(false); }}
                    >
                      <div className="export-item-icon" style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}>{ }</div>
                      JSON Data
                    </div>

                    <div
                      className="export-item"
                      onClick={() => { exportHTMLReport(data, summary, lowStock); setExportOpen(false); }}
                    >
                      <div className="export-item-icon" style={{ background: "rgba(245,200,66,0.12)", color: "#f5c842" }}>📄</div>
                      HTML Report
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
              Loading inventory…
            </div>
          ) : (
            <>
              {/* ── Stats ── */}
              <div className="stat-grid">
                <StatCard label="Total Items" value={data.length} icon="📦" accent="#FF7A00" />
                <StatCard label="Categories" value={summary.length} icon="🗂" accent="#7c3aed" />
                <StatCard label="Total Value" value={`₹${totalValue.toLocaleString()}`} icon="💰" accent="#16a34a" />
                <StatCard label="Low Stock" value={lowStock.length} icon="⚠️" accent="#ef4444" />
              </div>

              {/* ── Chart + Low Stock ── */}
              <div className="grid-2">
                <div className="panel">
                  <div className="panel-title">Stock by Category</div>
                  <div style={{ height: "220px" }}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-title">Low Stock Alerts</div>
                  {lowStock.length === 0 ? (
                    <div style={{ color: "#aaa", fontSize: "0.82rem", marginTop: "8px" }}>No low stock items 🎉</div>
                  ) : (
                    lowStock.slice(0, 6).map((item, i) => (
                      <div key={i} className="ls-row">
                        <span style={{ color: "#444" }}>{item.product_name}</span>
                        <span className={`badge ${item.quantity <= 2 ? "badge-red" : "badge-yellow"}`}>
                          {item.quantity} left
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ── Table ── */}
              <div className="tbl-panel">
                <div className="tbl-header">
                  <div className="tbl-title">Inventory List</div>
                  <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                      className="search-input"
                      placeholder="Search product or category…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#aaa" }}>
                          No results found
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item, i) => (
                        <tr key={i}>
                          <td style={{ color: "#bbb" }}>{i + 1}</td>
                          <td className="td-name">{item.product_name}</td>
                          <td><span className="td-cat">{item.category}</span></td>
                          <td>
                            <span className={`qty-pill ${item.quantity <= 5 ? "qty-low" : "qty-ok"}`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td>₹{item.price}</td>
                          <td style={{ color: "#FF7A00", fontWeight: 500 }}>₹{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </div>

      <Chatbot />
    </>
  );
}

export default Dashboard;