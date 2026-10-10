import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getIncidentById, addComment, uploadAttachments, deleteComment } from "../api/incidentApi";
import { useAuth } from "../auth/AuthContext";

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    getIncidentById(id).then(setTicket);
  }, [id]);

  async function submitComment() {
    const updated = await addComment(id, comment);
    setTicket(updated);
    setComment("");
  }

  async function submitFiles() {
    if (!files || files.length === 0) {
      alert("Please select at least one file.");
      return;
    }
    if (files.length > 3) {
      alert("Maximum 3 attachments allowed.");
      return;
    }
    try {
      const updated = await uploadAttachments(id, files);
      setTicket(updated);
      setFiles([]);
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    const updated = await deleteComment(id, commentId);
    setTicket(updated);
  }

  if (!ticket) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <p className="page-subtitle">Loading incident details...</p>
    </div>
  );

  const statusClass =
    ticket.status === "RESOLVED" ? "hub-badge-active" :
    ticket.status === "IN_PROGRESS" ? "hub-badge-maintenance" :
    "hub-badge-oos";

  const currentUserId = user?.sub || user?.id || "";

  return (
    <div className="page fade-in">

      <div className="section-header">
        <div>
          <p className="breadcrumbs">Incidents / {ticket.id}</p>
          <h2 className="page-title">{ticket.title}</h2>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <span className={"hub-badge " + statusClass}>{ticket.status}</span>
            <span className="badge">{ticket.priority}</span>
            <span className="tag">{ticket.category}</span>
          </div>
        </div>
        <button className="ghost-button" onClick={() => navigate("/incidents")}
        >
          ← Back
        </button>
      </div>

      <div className="quick-access" style={{ marginBottom: 20 }}>
        <h3 className="section-title">Description</h3>
        <p style={{ color: "var(--text)", lineHeight: 1.7, marginBottom: 16 }}>
          {ticket.description}
        </p>

        {ticket.phone && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#f0f7ff", border: "1px solid #bfdbfe",
            borderRadius: 10, padding: "10px 14px", marginTop: 8
          }}>
            <span style={{ fontSize: 18 }}>📞</span>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                CONTACT NUMBER
              </p>
              <a href={"tel:" + ticket.phone}
                style={{ color: "var(--primary)", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                {ticket.phone}
              </a>
            </div>
          </div>
        )}

        {ticket.locationText && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#f9f9f9", border: "1px solid var(--border)",
            borderRadius: 10, padding: "10px 14px", marginTop: 8
          }}>
            <span style={{ fontSize: 18 }}>📍</span>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                LOCATION
              </p>
              <p style={{ margin: 0, fontWeight: 600 }}>{ticket.locationText}</p>
            </div>
          </div>
        )}

        {ticket.resolutionNotes && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 10, padding: "10px 14px", marginTop: 8
          }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#166534", fontWeight: 600 }}>
                RESOLUTION NOTES
              </p>
              <p style={{ margin: 0, color: "#166534" }}>{ticket.resolutionNotes}</p>
            </div>
          </div>
        )}
      </div>

      <div className="file-table-section" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <h3 className="section-title" style={{ margin: 0 }}>Comments</h3>
        </div>

        {!ticket.comments || ticket.comments.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No comments yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {ticket.comments.map(c => (
              <div
                key={c.id}
                className="card"
                style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 14 }}>{c.content}</p>
                  {c.userId && (
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted)" }}>
                      by {c.userId}
                    </p>
                  )}
                </div>
                {c.userId === currentUserId && (
                  <button
                    className="hub-btn-danger"
                    style={{ fontSize: 12, padding: "4px 10px" }}
                    onClick={() => handleDeleteComment(c.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <input
            className="modern-input"
            placeholder="Write a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="primary-button" onClick={submitComment}>
            Post
          </button>
        </div>
      </div>

    <div className="file-table-section">
      <div className="section-header">
        <h3 className="section-title" style={{ margin: 0 }}>Attachments</h3>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>Max 3 files</span>
      </div>

      {ticket.attachmentFileIds && ticket.attachmentFileIds.length > 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          {ticket.attachmentFileIds.map((fileId, index) => (
            <div key={fileId} style={{
              border: "1px solid var(--border)", borderRadius: 12,
              overflow: "hidden", width: 160, background: "#f9f9f9"
            }}>
              <img
                src={"http://localhost:8081/api/incidents/attachments/" + fileId}
                alt={"Attachment " + (index + 1)}
                style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                onError={e => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div style={{
                display: "none", alignItems: "center", justifyContent: "center",
                height: 120, flexDirection: "column", gap: 8
              }}>
                <span style={{ fontSize: 32 }}>📎</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>File {index + 1}</span>
              </div>
              <div style={{ padding: "8px 10px", borderTop: "1px solid var(--border)" }}>
                
                  <a href={"http://localhost:8081/api/incidents/attachments/" + fileId}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
                >
                  ⬇ Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {(!ticket.attachmentFileIds || ticket.attachmentFileIds.length < 3) && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setFiles(Array.from(e.target.files))}
            style={{ flex: 1, fontSize: 14, color: "var(--muted)" }}
          />
          <button className="primary-button" onClick={submitFiles}>
            Upload
          </button>
        </div>
      )}

      {ticket.attachmentFileIds && ticket.attachmentFileIds.length >= 3 && (
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
          ✅ Maximum 3 attachments reached.
        </p>
      )}
    </div>

    </div>
  );
}
