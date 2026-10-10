import { useEffect, useState } from "react";
import { getAllIncidents, updateIncidentStatus, assignTechnician, getAllUsers } from "../api/incidentApi";
import { Link } from "react-router-dom";
import "../index.css";

export default function AdminIncidents() {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [assignInputs, setAssignInputs] = useState({});
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    Promise.all([getAllIncidents(), getAllUsers()])
      .then(([ticketsData, usersData]) => {
        if (Array.isArray(ticketsData)) setTickets(ticketsData);
        else { setError("Failed to load tickets."); setTickets([]); }
        
        if (Array.isArray(usersData)) {
          setAllUsers(usersData);
          setTechnicians(usersData.filter(u => u.role === 'TECHNICIAN'));
        }
      })
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, []);

  function showSuccess(msg) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  }

  function showError(msg) {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  }

  async function handleStatusChange(ticketId, newStatus) {
    const notes =
      newStatus === "RESOLVED" || newStatus === "CLOSED"
        ? window.prompt("Enter resolution notes (optional):") || ""
        : newStatus === "REJECTED"
        ? window.prompt("Enter rejection reason:") || ""
        : "";
    try {
      const updated = await updateIncidentStatus(ticketId, newStatus, notes);
      if (updated && updated.id) {
        setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
        showSuccess(`Status updated to ${newStatus}`);
      } else {
        showError("Status update failed.");
        console.error("Bad response:", updated);
      }
    } catch (err) {
      showError("Error: " + err.message);
    }
  }

  async function handleAssign(ticketId) {
    const techId = assignInputs[ticketId]?.trim();
    if (!techId) { showError("Please enter a Technician ID."); return; }
    try {
      const updated = await assignTechnician(ticketId, techId);
      if (updated && updated.id) {
        setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
        setAssignInputs(prev => ({ ...prev, [ticketId]: "" }));
        showSuccess(`Technician assigned successfully!`);
      } else {
        showError("Assignment failed.");
        console.error("Bad response:", updated);
      }
    } catch (err) {
      showError("Error: " + err.message);
    }
  }

  const statusClass = (status) =>
    status === "RESOLVED" || status === "CLOSED" ? "hub-badge-active" :
    status === "IN_PROGRESS" ? "hub-badge-maintenance" :
    "hub-badge-oos";

  const nextStatuses = (current) => ({
    "OPEN": ["IN_PROGRESS", "REJECTED"],
    "IN_PROGRESS": ["RESOLVED", "REJECTED"],
    "RESOLVED": ["CLOSED"],
    "CLOSED": [],
    "REJECTED": [],
  }[current] || []);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "OPEN").length,
    inProgress: tickets.filter(t => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter(t => t.status === "RESOLVED").length,
    closed: tickets.filter(t => t.status === "CLOSED").length,
    rejected: tickets.filter(t => t.status === "REJECTED").length,
    unassigned: tickets.filter(t => !t.assignedTechnicianId).length,
    critical: tickets.filter(t => t.priority === "CRITICAL").length,
  };

  const filteredTickets = filterStatus === "ALL"
    ? tickets
    : tickets.filter(t => t.status === filterStatus);

  if (loading) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <p className="page-subtitle">Loading tickets...</p>
    </div>
  );

  const getTechName = (techId) => {
    const tech = technicians.find(t => t.id === techId);
    return tech ? (tech.name || tech.email || tech.id.substring(0, 12)) : techId.substring(0, 12);
  };

  const getReporterName = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? (user.name || user.email || user.id.substring(0, 12)) : userId.substring(0, 12);
  };

  return (
    <div className="page fade-in">
      <div className="section-header">
        <div>
          <p className="breadcrumbs">Admin / Incidents</p>
          <h2 className="page-title">All Incident Tickets</h2>
          <p className="page-subtitle">{tickets.length} total tickets</p>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 20,
        marginBottom: 32
      }}>
        {[
          { label: "Total", value: stats.total, color: "#0f4c81", bg: "#e9f1fb", emoji: "🎫" },
          { label: "Open", value: stats.open, color: "#92400e", bg: "#fef3c7", emoji: "🟡" },
          { label: "In Progress", value: stats.inProgress, color: "#1e40af", bg: "#dbeafe", emoji: "🔵" },
          { label: "Resolved", value: stats.resolved, color: "#166534", bg: "#dcfce7", emoji: "✅" },
          { label: "Closed", value: stats.closed, color: "#374151", bg: "#f3f4f6", emoji: "🔒" },
          { label: "Rejected", value: stats.rejected, color: "#991b1b", bg: "#fee2e2", emoji: "❌" },
        ].map(stat => (
          <div
            key={stat.label}
            onClick={() => setFilterStatus(
              stat.label === "Total" ? "ALL" :
              stat.label === "In Progress" ? "IN_PROGRESS" :
              stat.label.toUpperCase()
            )}
            style={{
              background: stat.bg,
              border: "1px solid " + stat.color + "33",
              borderRadius: 14,
              padding: "14px 16px",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              boxShadow: filterStatus === (
                stat.label === "Total" ? "ALL" :
                stat.label === "In Progress" ? "IN_PROGRESS" :
                stat.label.toUpperCase()
              ) ? "0 0 0 2px " + stat.color : "none",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.emoji}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: stat.color, opacity: 0.8 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {filterStatus !== "ALL" && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 12, fontSize: 13, color: "var(--muted)"
        }}>
          <span>Showing: <strong style={{ color: "var(--text)" }}>{filterStatus}</strong> tickets ({filteredTickets.length})</span>
          <button
            onClick={() => setFilterStatus("ALL")}
            style={{
              padding: "2px 10px", fontSize: 11, borderRadius: 999,
              border: "1px solid var(--border)", background: "#fff",
              cursor: "pointer", fontWeight: 600
            }}
          >
            Clear filter ✕
          </button>
        </div>
      )}

      {success && (
        <div style={{
          background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0",
          borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontWeight: 600, fontSize: 14
        }}>✅ {success}</div>
      )}
      {error && (
        <div style={{
          background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca",
          borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontWeight: 600, fontSize: 14
        }}>❌ {error}</div>
      )}

      <div className="file-table-section">
        <table className="file-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Reported By</th>
              <th>📞 Contact</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>
                  No tickets found.
                </td>
              </tr>
            ) : (
              filteredTickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>
                    <Link to={`/incidents/${ticket.id}`} style={{ color: "var(--primary)", fontWeight: 600 }}>
                      {ticket.title}
                    </Link>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 12, wordBreak: "break-all" }}>
                    {getReporterName(ticket.reportedByUserId)}
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {ticket.phone
                      ? <a href={"tel:" + ticket.phone} style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                          {ticket.phone}
                        </a>
                      : <span style={{ color: "var(--muted)" }}>—</span>}
                  </td>
                  <td>
                    <span className={"hub-badge " + statusClass(ticket.status)} style={{ fontSize: 11 }}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ fontSize: 11 }}>{ticket.priority}</span>
                  </td>
                  <td style={{ fontSize: 12, wordBreak: "break-all" }}>
                    {ticket.assignedTechnicianId
                      ? <span style={{ color: "var(--success)", fontWeight: 600 }}>
                          ✓ {getTechName(ticket.assignedTechnicianId)}
                        </span>
                      : <span style={{ color: "var(--muted)" }}>Unassigned</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <select
                          style={{
                            flex: 1, padding: "4px 8px", fontSize: 11,
                            borderRadius: 8, border: "1px solid var(--border)",
                            background: "#f9f9f9", minWidth: 0
                          }}
                          value={assignInputs[ticket.id] || ""}
                          onChange={e => setAssignInputs(prev => ({
                            ...prev, [ticket.id]: e.target.value
                          }))}
                        >
                          <option value="">Select Technician</option>
                          {technicians.map(tech => (
                            <option key={tech.id} value={tech.id}>{tech.name || tech.email || tech.id}</option>
                          ))}
                        </select>
                        <button
                          style={{
                            padding: "4px 10px", fontSize: 11, borderRadius: 8,
                            border: "1px solid var(--border)", background: "#fff",
                            cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600
                          }}
                          onClick={() => handleAssign(ticket.id)}
                        >
                          Assign
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {nextStatuses(ticket.status).map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(ticket.id, status)}
                            style={{
                              padding: "4px 10px", fontSize: 11, borderRadius: 8,
                              border: "none", cursor: "pointer", fontWeight: 700,
                              background: status === "REJECTED" ? "#ef4444" :
                                          status === "RESOLVED" ? "#0f4c81" :
                                          status === "CLOSED" ? "#12805c" : "#0f4c81",
                              color: "#fff", whiteSpace: "nowrap"
                            }}
                          >
                            {status}
                          </button>
                        ))}
                        {nextStatuses(ticket.status).length === 0 && (
                          <span style={{ color: "var(--muted)", fontSize: 11 }}>—</span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
