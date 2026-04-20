import { Link } from "react-router-dom";

const roles = [
  { label: "Admin", path: "/login/admin", icon: "🧑‍💼" },
  { label: "Donor", path: "/login/donor", icon: "🩸" },
  { label: "Volunteer", path: "/login/volunteer", icon: "🙋" },
];

export default function Landing() {
  return (
    <div className="auth-shell">
      <section className="auth-card auth-card--hero">
        <div className="auth-badge">Blood Flow</div>
        <h1>Choose your access</h1>
        <p>Secure role-based entry for Admin, Donor, and Volunteer accounts.</p>

        <div className="role-grid">
          {roles.map((role) => (
            <Link key={role.label} to={role.path} className="role-button">
              <span className="role-button__icon">{role.icon}</span>
              <span className="role-button__text">{role.label}</span>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <Link className="link-button" to="/register">
            Create account
          </Link>
        </div>
      </section>
    </div>
  );
}
