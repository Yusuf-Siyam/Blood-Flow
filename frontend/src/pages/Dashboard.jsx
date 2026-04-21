import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

const labels = {
  admin: "Admin Dashboard",
  donor: "Donor Dashboard",
  volunteer: "Volunteer Dashboard",
};

export default function Dashboard() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    [],
  );
  const token = localStorage.getItem("token");
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(role === "donor");
  const [actionLoading, setActionLoading] = useState(false);
  const [continueMessage, setContinueMessage] = useState("");
  const [requestViewMode, setRequestViewMode] = useState("nearby");
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    bloodGroup: user?.bloodGroup || "A+",
    number: user?.number || "",
    division: "",
    district: user?.location || "",
    location: user?.location || "",
    lastDonationDate: "",
    availability: true,
  });
  const [requestForm, setRequestForm] = useState({
    patientName: user?.name || "",
    bloodGroup: user?.bloodGroup || "A+",
    division: "",
    district: user?.location || "",
    location: user?.location || "",
    hospital: "",
    contactPhone: user?.number || "",
    requiredDate: new Date().toISOString().slice(0, 10),
    unitsNeeded: 1,
    urgency: "normal",
    note: "",
    status: "active",
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
          patientName: data.donor?.name || prev.patientName,
          bloodGroup: data.donor?.bloodGroup || prev.bloodGroup,
          division: data.donor?.division || prev.division,
          district: data.donor?.district || prev.district,
          location: data.donor?.location || prev.location,
          contactPhone: data.donor?.number || prev.contactPhone,
        }));
        setProfileForm({
          name: data.donor?.name || user?.name || "",
          bloodGroup: data.donor?.bloodGroup || user?.bloodGroup || "A+",
          number: data.donor?.number || user?.number || "",
          division: data.donor?.division || "",
          district: data.donor?.district || user?.location || "",
          location: data.donor?.location || user?.location || "",
          lastDonationDate: data.donor?.lastDonationDate
            ? new Date(data.donor.lastDonationDate).toISOString().slice(0, 10)
            : "",
          availability: Boolean(data.donor?.availability),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [role, token, user?.bloodGroup, user?.location, user?.name, user?.number]);

  useEffect(() => {
    const continued = searchParams.get("continued");
    if (!continued || role !== "donor") return;

    if (continued === "request-blood") {
      setContinueMessage(
        "You are logged in. Fill out the form below to request blood.",
      );
    }

    if (continued === "accept-request") {
      setContinueMessage(
        "You are logged in. You can now accept an urgent request from the list.",
      );
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("continued");
    setSearchParams(nextParams);
  }, [role, searchParams, setSearchParams]);

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
      setProfileForm((prev) => ({
        ...prev,
        availability: data.availability,
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
      setRequestForm((prev) => ({
        ...prev,
        note: "",
        unitsNeeded: 1,
        hospital: "",
        requiredDate: new Date().toISOString().slice(0, 10),
      }));
      setContinueMessage("Blood request submitted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, nextStatus) => {
    try {
      setActionLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/donor/requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nextStatus }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Status update failed");

      setDashboard((prev) => ({
        ...prev,
        nearbyRequests: (prev?.nearbyRequests || []).map((request) =>
          request._id === requestId
            ? { ...request, status: nextStatus }
            : request,
        ),
        allActiveRequests: (prev?.allActiveRequests || []).map((request) =>
          request._id === requestId
            ? { ...request, status: nextStatus }
            : request,
        ),
      }));
      setContinueMessage(data.message || `Request moved to ${nextStatus}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError("");
      const payload = {
        ...profileForm,
        availability: Boolean(profileForm.availability),
      };

      const res = await fetch("http://localhost:5000/api/donor/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setProfileForm((prev) => ({
        ...prev,
        ...data.profile,
        lastDonationDate: data.profile?.lastDonationDate
          ? new Date(data.profile.lastDonationDate).toISOString().slice(0, 10)
          : "",
      }));

      setDashboard((prev) => ({
        ...prev,
        donor: {
          ...prev?.donor,
          ...data.profile,
        },
      }));

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            name: data.profile.name,
            number: data.profile.number,
            bloodGroup: data.profile.bloodGroup,
            location: data.profile.location,
          }),
        );
      }

      setContinueMessage("Profile updated successfully.");
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
        nearbyRequests:
          action === "decline"
            ? (prev?.nearbyRequests || []).filter(
                (item) => item._id !== requestId,
              )
            : (prev?.nearbyRequests || []).map((item) => {
                if (item._id !== requestId) return item;
                return { ...item, status: "accepted" };
              }),
        allActiveRequests:
          action === "decline"
            ? (prev?.allActiveRequests || []).filter(
                (item) => item._id !== requestId,
              )
            : (prev?.allActiveRequests || []).map((item) => {
                if (item._id !== requestId) return item;
                return { ...item, status: "accepted" };
              }),
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
      setContinueMessage(data.message || "Request response submitted.");
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
  const allActiveRequests = dashboard?.allActiveRequests || [];
  const displayedRequests =
    requestViewMode === "all" ? allActiveRequests : nearbyRequests;
  const donationHistory = dashboard?.donationHistory || [];
  const rewards = dashboard?.rewards || {
    points: 0,
    badge: "Bronze",
    trustScore: 50,
  };

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
        {continueMessage && (
          <div className="form-alert form-alert--success">
            {continueMessage}
          </div>
        )}

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
              <button
                className="quick-button"
                type="button"
                onClick={() =>
                  document
                    .getElementById("request-form")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                📤 Request Blood
              </button>
              <button
                className="quick-button"
                type="button"
                onClick={() => {
                  setRequestViewMode("all");
                  document
                    .getElementById("request-feed")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                📥 View Requests
              </button>
            </div>
            <form
              id="request-form"
              className="donor-form"
              onSubmit={submitBloodRequest}
            >
              <label>
                Patient Name
                <input
                  value={requestForm.patientName}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      patientName: e.target.value,
                    }))
                  }
                  placeholder="Patient full name"
                  required
                />
              </label>
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
                Hospital
                <input
                  value={requestForm.hospital}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      hospital: e.target.value,
                    }))
                  }
                  placeholder="Hospital name"
                  required
                />
              </label>
              <label>
                Division
                <input
                  value={requestForm.division}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      division: e.target.value,
                    }))
                  }
                  placeholder="Dhaka, Chattogram"
                  required
                />
              </label>
              <label>
                District
                <input
                  value={requestForm.district}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      district: e.target.value,
                    }))
                  }
                  placeholder="District"
                  required
                />
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
                Contact Phone
                <input
                  value={requestForm.contactPhone}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      contactPhone: e.target.value,
                    }))
                  }
                  placeholder="01XXXXXXXXX"
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
                Required Date
                <input
                  type="date"
                  value={requestForm.requiredDate}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      requiredDate: e.target.value,
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
              <label>
                Save As
                <select
                  value={requestForm.status}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label className="donor-form-full">
                Notes
                <input
                  value={requestForm.note}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                  placeholder="Optional request notes"
                />
              </label>
              <button className="primary-button" disabled={actionLoading}>
                Submit Request
              </button>
            </form>
          </article>
        </section>

        <section className="donor-grid donor-grid--bottom">
          <article id="request-feed" className="donor-card">
            <h2>
              {requestViewMode === "all"
                ? "All Active Requests"
                : "Nearby Requests"}
            </h2>
            <p>
              {requestViewMode === "all"
                ? "Showing all currently active requests."
                : "Matching requests by blood group, district, urgency and status."}
            </p>
            <div className="quick-action-buttons">
              <button
                className="quick-button"
                type="button"
                onClick={() => setRequestViewMode("nearby")}
              >
                Matched
              </button>
              <button
                className="quick-button"
                type="button"
                onClick={() => setRequestViewMode("all")}
              >
                All Active
              </button>
            </div>
            {displayedRequests.length === 0 ? (
              <p className="empty-state">No requests available in this view.</p>
            ) : (
              <div className="request-list">
                {displayedRequests.map((request) => (
                  <div className="request-item" key={request._id}>
                    <div>
                      <strong>{request.bloodGroup}</strong> • {request.location}
                      <p>
                        {request.urgency === "critical" ? "Critical" : "Normal"}{" "}
                        • {request.unitsNeeded} unit(s) • Status:{" "}
                        {request.status}
                      </p>
                      {request.matchScore ? (
                        <p>Match Score: {request.matchScore}</p>
                      ) : null}
                    </div>
                    <div className="request-actions">
                      {request.status === "active" && (
                        <>
                          <button
                            className="accept-btn"
                            onClick={() =>
                              respondToRequest(request._id, "accept")
                            }
                            disabled={actionLoading}
                          >
                            Accept
                          </button>
                          <button
                            className="decline-btn"
                            onClick={() =>
                              respondToRequest(request._id, "decline")
                            }
                            disabled={actionLoading}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {request.status === "accepted" && (
                        <button
                          className="accept-btn"
                          onClick={() =>
                            updateRequestStatus(request._id, "in_progress")
                          }
                          disabled={actionLoading}
                        >
                          Move to In Progress
                        </button>
                      )}
                      {request.status === "in_progress" && (
                        <button
                          className="accept-btn"
                          onClick={() =>
                            updateRequestStatus(request._id, "completed")
                          }
                          disabled={actionLoading}
                        >
                          Mark as Completed
                        </button>
                      )}
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
                    <p>{entry.status || "accepted"}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <section className="donor-grid donor-grid--bottom">
          <article className="donor-card">
            <h2>Profile Management</h2>
            <p>Update donor profile, location and eligibility details.</p>
            <form className="donor-form" onSubmit={saveProfile}>
              <label>
                Name
                <input
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Blood Group
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
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
                Phone
                <input
                  value={profileForm.number}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      number: e.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Division
                <input
                  value={profileForm.division}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      division: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                District
                <input
                  value={profileForm.district}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      district: e.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Last Donation Date
                <input
                  type="date"
                  value={profileForm.lastDonationDate}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      lastDonationDate: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Availability
                <select
                  value={profileForm.availability ? "on" : "off"}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      availability: e.target.value === "on",
                    }))
                  }
                >
                  <option value="on">Available</option>
                  <option value="off">Not Available</option>
                </select>
              </label>
              <button className="primary-button" disabled={actionLoading}>
                Save Profile
              </button>
            </form>
          </article>

          <article className="donor-card">
            <h2>Rewards</h2>
            <p>Points, badge level and trust score.</p>
            <div className="reward-grid">
              <div className="reward-box">
                <h3>Total Points</h3>
                <strong>{rewards.points}</strong>
              </div>
              <div className="reward-box">
                <h3>Badge</h3>
                <strong>{rewards.badge}</strong>
              </div>
              <div className="reward-box">
                <h3>Trust Score</h3>
                <strong>{rewards.trustScore}</strong>
              </div>
            </div>
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
