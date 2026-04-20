import { Link, Navigate, useParams } from "react-router-dom";

const labels = {
  admin: "Admin Dashboard",
  donor: "Donor Dashboard",
  volunteer: "Volunteer Dashboard",
};

export default function Dashboard() {
  const { role } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    return <Navigate to={`/login/${role || "donor"}`} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={`/login/${user.role}`} replace />;
  }

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
