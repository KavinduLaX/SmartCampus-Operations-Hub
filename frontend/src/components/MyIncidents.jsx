import { useEffect, useState } from "react";
import { getMyIncidents, deleteIncident } from "../api/incidentApi";
import { Link, useNavigate } from "react-router-dom"; 
import "../index.css";

export default function MyIncidents() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyIncidents().then(setTickets);
  }, []);

  async function handleDelete(ticketId) {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    await deleteIncident(ticketId);
    setTickets(tickets.filter(t => t.id !== ticketId)); 
  }

  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2 className="page-title">My Incident Tickets</h2>
        <Link to="/incidents/new">
          <button className="primary-button">+ Create New Ticket</button>
        </Link>
      </div>

      <div className="file-table-section">
        <table className="hub-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Action</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "var(--muted)" }}>
                  No incidents found.
                </td>
              </tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.title}</td>
                  <td>
                    <span className={`hub-badge ${
                      ticket.status === "RESOLVED" ? "hub-badge-active" :
                      ticket.status === "IN_PROGRESS" ? "hub-badge-maintenance" :
                      "hub-badge-oos"
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    <span className="badge">{ticket.priority}</span>
                  </td>
                  <td>
                    <Link to={`/incidents/${ticket.id}`}>
                      <button className="ghost-button">View</button>
                    </Link>
                  </td>
                  <td>
                    <button
                      className="hub-btn-danger"
                      onClick={() => handleDelete(ticket.id)}
                    >
                      Delete
                    </button>
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
