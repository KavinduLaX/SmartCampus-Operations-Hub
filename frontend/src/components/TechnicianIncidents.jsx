import { useEffect, useState } from "react";
import { getAssignedIncidents, updateIncidentStatus } from "../api/incidentApi";
import { Link } from "react-router-dom";
import "../index.css";

export default function TechnicianIncidents() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getAssignedIncidents()
      .then(data => {
        if (Array.isArray(data)) setTickets(data);
        else { setError("Failed to load assigned tickets."); setTickets([]); }
      })
      .catch(() => setError("Failed to load assigned tickets."))
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
    const notes = newStatus === "RESOLVED"
      ? window.prompt("Enter resolution notes:") || ""
      : "";
    try {
      const updated = await updateIncidentStatus(ticketId, newStatus, notes);
      if (updated && updated.id) {
        setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
        showSuccess(`Ticket marked as ${newStatus}`);
      } else {
        showError("Status update failed.");
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

  if (loading) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <p className="page-subtitle">Loading assigned tickets...</p>
    </div>
  );

  return (
    <div className="page fade-in">
      <div className="section-header">
        <div>
          <p className="breadcrumbs">Technician / My Assignments</p>
          <h2 className="page-title">Assigned Tickets</h2>
          <p className="page-subtitle">{tickets.length} tickets assigned to you</p>
        </div>
      </div>

      {success && (
        <div style={{
          background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0",
          borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontWeight: 600
        }}>
          ✅ {success}
        </div>
      )}

      {error && (
        <div style={{
          background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca",
          borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontWeight: 600
        }}>
          ❌ {error}
        </div>
      )}

      <div className="file-table-section">
        <table className="hub-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Resolution Notes</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>
                  No tickets assigned to you yet.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => {
                return (
                  <tr key={ticket.id}>
                    <td>
                      <Link
                        to={`/incidents/${ticket.id}`}
                        style={{ color: "var(--primary)", fontWeight: 600 }}
                      >
                        {ticket.title}
                      </Link>
                    </td>

                    <td style={{ color: "var(--muted)", fontSize: 13 }}>
                      {ticket.category}
                    </td>

                    <td>
                      <span className={`hub-badge ${statusClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>

                    <td>
                      <span className="badge">{ticket.priority}</span>
                    </td>

                    <td style={{ color: "var(--muted)", fontSize: 13 }}>
                      {ticket.resolutionNotes || "—"}
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Link to={`/incidents/${ticket.id}`}>
                          <button className="ghost-button" style={{ fontSize: 12 }}>
                            View
                          </button>
                        </Link>

                        {ticket.status === "IN_PROGRESS" && (
                          <button
                            className="primary-button"
                            style={{ padding: "6px 12px", fontSize: 12 }}
                            onClick={() =>
                              handleStatusChange(ticket.id, "RESOLVED")
                            }
                          >
                            ✓ Mark Resolved
                          </button>
                        )}

                        {ticket.status === "OPEN" && (
                          <button
                            className="primary-button"
                            style={{ padding: "6px 12px", fontSize: 12 }}
                            onClick={() =>
                              handleStatusChange(ticket.id, "IN_PROGRESS")
                            }
                          >
                            → Start Work
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
