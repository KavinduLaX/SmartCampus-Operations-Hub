import { useState } from "react";
import { createIncident } from "../api/incidentApi";
import { useNavigate } from "react-router-dom";

export default function CreateIncident() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("LOW");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  function validate() {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^0\d{9}$/.test(phone.trim())) {
      newErrors.phone = "Phone must be 10 digits and start with 0.";
    }
    if (!category.trim()) newErrors.category = "Category is required.";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await createIncident({ title, description, phone, category, priority });
      navigate("/incidents");
    } catch (err) {
      setErrors({ submit: "Failed to submit ticket. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const fieldError = (field) => errors[field] ? (
    <p style={{ color: "#dc2626", fontSize: 12, margin: "4px 0 0", fontWeight: 500 }}>
      ⚠ {errors[field]}
    </p>
  ) : null;

  return (
    <div className="page fade-in">
      <div className="section-header">
        <div>
          <p className="breadcrumbs">Incidents / New</p>
          <h2 className="page-title">Create Incident Ticket</h2>
          <p className="page-subtitle">All fields are required</p>
        </div>
      </div>

      {errors.submit && (
        <div style={{
          background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca",
          borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontWeight: 600, fontSize: 14
        }}>
          ❌ {errors.submit}
        </div>
      )}

      <div className="quick-access" style={{ maxWidth: 600 }}>
        <div className="input-group">
          <label className="input-label">
            Title <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            className="modern-input"
            placeholder="Enter incident title"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: "" })); }}
            style={errors.title ? { borderColor: "#dc2626" } : {}}
          />
          {fieldError("title")}
        </div>

        <div className="input-group">
          <label className="input-label">
            Description <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <textarea
            className="modern-input"
            placeholder="Describe the incident in detail..."
            value={description}
            onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: "" })); }}
            rows={4}
            style={{ resize: "vertical", ...(errors.description ? { borderColor: "#dc2626" } : {}) }}
          />
          {fieldError("description")}
        </div>

        <div className="input-group">
          <label className="input-label">
            Contact Phone Number <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            className="modern-input"
            placeholder="e.g. 0771234567"
            value={phone}
            maxLength={10}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, ""); 
              setPhone(val);
              setErrors(p => ({ ...p, phone: "" }));
            }}
            style={errors.phone ? { borderColor: "#dc2626" } : {}}
          />
          {fieldError("phone")}
          <p style={{ color: "var(--muted)", fontSize: 12, margin: "4px 0 0" }}>
            Must be 10 digits starting with 0
          </p>
        </div>

        <div className="input-group">
          <label className="input-label">
            Category <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            className="modern-input"
            placeholder="e.g. Network, Hardware, Software"
            value={category}
            onChange={e => { setCategory(e.target.value); setErrors(p => ({ ...p, category: "" })); }}
            style={errors.category ? { borderColor: "#dc2626" } : {}}
          />
          {fieldError("category")}
        </div>

        <div className="input-group">
          <label className="input-label">
            Priority <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            className="modern-input"
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value="LOW">🟢 Low</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="HIGH">🟠 High</option>
            <option value="CRITICAL">🔴 Critical</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            className="primary-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
          <button
            className="ghost-button"
            onClick={() => navigate("/incidents")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
