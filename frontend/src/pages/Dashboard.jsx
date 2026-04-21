import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

const labels = {
  admin: "Admin Dashboard",
  donor: "Donor Dashboard",
  volunteer: "Volunteer Dashboard",
};

export default function Dashboard() {
  const { role } = useParams();
  const navigate = useNavigate();
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    [],
  );
  const token = localStorage.getItem("token");
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(role === "donor");
  const [actionLoading, setActionLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({
    bloodGroup: user?.bloodGroup || "A+",
    location: user?.location || "",
    unitsNeeded: 1,
    urgency: "normal",
    note: "",
  });

  useEffect(() => {
    if (role !== "donor" || !token) {
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("http://localhost:5000/api/donor/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to load dashboard");
        setDashboard(data);
        setRequestForm((prev) => ({
          ...prev,
          bloodGroup: data.donor?.bloodGroup || prev.bloodGroup,
          location: data.donor?.location || prev.location,
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [role, token]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleAvailability = async () => {
    if (!dashboard?.donor) return;
    try {
      setActionLoading(true);
      const res = await fetch("http://localhost:5000/api/donor/availability", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability: !dashboard.donor.availability }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update availability");
      setDashboard((prev) => ({
        ...prev,
        donor: {
          ...prev.donor,
          availability: data.availability,
        },
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const submitBloodRequest = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError("");
      const res = await fetch("http://localhost:5000/api/donor/request-blood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create request");
      setDashboard((prev) => ({
        ...prev,
        nearbyRequests: [data.request, ...(prev?.nearbyRequests || [])].slice(
          0,
          8,
        ),
      }));
      setRequestForm((prev) => ({ ...prev, note: "", unitsNeeded: 1 }));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      setActionLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/donor/respond/${requestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to respond");

      setDashboard((prev) => ({
        ...prev,
        nearbyRequests: (prev?.nearbyRequests || []).filter(
          (item) => item._id !== requestId,
        ),
        donationHistory:
          action === "accept"
            ? [
                {
                  date: new Date().toISOString(),
                  location:
                    (prev?.nearbyRequests || []).find(
                      (item) => item._id === requestId,
                    )?.location || "Unknown",
                  notes: "Responded to urgent request",
                },
                ...(prev?.donationHistory || []),
              ]
            : prev?.donationHistory || [],
      }));
      setError(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return <Navigate to={`/login/${role || "donor"}`} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={`/login/${user.role}`} replace />;
  }

  if (role !== "donor") {
    return (
      <div className="auth-shell">
        <section className="auth-card">
          <div className="auth-badge">{labels[role] || "Dashboard"}</div>
          <h1>Welcome, {user.name}</h1>
          <p>Your account is locked to the {user.role} dashboard only.</p>

          <div className="user-summary">
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Number:</strong> {user.number}
            </div>
            <div>
              <strong>Blood Group:</strong> {user.bloodGroup}
            </div>
            <div>
              <strong>Location:</strong> {user.location}
            </div>
          </div>

          <Link to="/" className="link-button">
            Back to role select
          </Link>
        </section>
      </div>
    );
  }

  const donor = dashboard?.donor;
  const nearbyRequests = dashboard?.nearbyRequests || [];
  const donationHistory = dashboard?.donationHistory || [];

  if (loading) {
    return (
      <div className="auth-shell">
        <section className="auth-card">
          <div className="auth-badge">Donor Dashboard</div>
          <h1>Loading donor dashboard...</h1>
        </section>
      </div>
    );
  }

  return (
    <div className="donor-shell">
      <div className="donor-bg-orb donor-bg-orb--one" />
      <div className="donor-bg-orb donor-bg-orb--two" />
      <main className="donor-layout">
        <header className="donor-header">
          <div>
            <p className="donor-kicker">Donor Command Center</p>
            <h1>
              Welcome, {donor?.name || user.name}{" "}
              <span>({donor?.bloodGroup || user.bloodGroup})</span>
            </h1>
          </div>
          <button className="donor-logout" onClick={logout}>
            Logout
          </button>
        </header>

        {error && <div className="form-alert form-alert--error">{error}</div>}

        <section className="donor-grid donor-grid--top">
          <article className="donor-card donor-card--status">
            <h2>Status Card</h2>
            <p>Availability for emergency matches in your area.</p>
            <button
              className={`availability-toggle ${donor?.availability ? "is-on" : "is-off"}`}
              onClick={toggleAvailability}
              disabled={actionLoading}
            >
              {donor?.availability ? "🟢 Available" : "🔴 Not Available"}
            </button>
          </article>

          <article className="donor-card donor-card--actions">
            <h2>Quick Actions</h2>
            <p>Publish or respond quickly from one place.</p>
            <div className="quick-action-buttons">
              <button className="quick-button">📤 Request Blood</button>
              <button className="quick-button">📥 Respond to Requests</button>
            </div>
            <form className="donor-form" onSubmit={submitBloodRequest}>
              <label>
                🩸 Blood Group
                <select
                  value={requestForm.bloodGroup}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      bloodGroup: e.target.value,
                    }))
                  }
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </label>
              <label>
                📍 Location
                <input
                  value={requestForm.location}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Hospital/area"
                  required
                />
              </label>
              <label>
                Units Needed
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={requestForm.unitsNeeded}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      unitsNeeded: Number(e.target.value),
                    }))
                  }
                  required
                />
              </label>
              <label>
                Urgency
                <select
                  value={requestForm.urgency}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      urgency: e.target.value,
                    }))
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="critical">Critical</option>
                </select>
              </label>
              <button className="primary-button" disabled={actionLoading}>
                Submit Request
              </button>
            </form>
          </article>
        </section>

        <section className="donor-grid donor-grid--bottom">
          <article className="donor-card">
            <h2>Nearby Requests</h2>
            <p>Urgent requests around your location.</p>
            {nearbyRequests.length === 0 ? (
              <p className="empty-state">
                No urgent nearby requests right now.
              </p>
            ) : (
              <div className="request-list">
                {nearbyRequests.map((request) => (
                  <div className="request-item" key={request._id}>
                    <div>
                      <strong>{request.bloodGroup}</strong> at{" "}
                      {request.location}
                      <p>
                        {request.urgency === "critical" ? "Critical" : "Normal"}{" "}
                        • {request.unitsNeeded} unit(s)
                      </p>
                    </div>
                    <div className="request-actions">
                      <button
                        className="accept-btn"
                        onClick={() => respondToRequest(request._id, "accept")}
                        disabled={actionLoading}
                      >
                        Accept
                      </button>
                      <button
                        className="decline-btn"
                        onClick={() => respondToRequest(request._id, "decline")}
                        disabled={actionLoading}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="donor-card">
            <h2>Donation History</h2>
            <p>Past donations with date and location.</p>
            {donationHistory.length === 0 ? (
              <p className="empty-state">No donation history yet.</p>
            ) : (
              <ul className="history-list">
                {donationHistory.map((entry, index) => (
                  <li key={`${entry.date}-${index}`}>
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                    <strong>{entry.location}</strong>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <div className="donor-footer-link">
          <Link to="/" className="link-button">
            Back to role select
          </Link>
        </div>
      </main>
    </div>
  );
}
