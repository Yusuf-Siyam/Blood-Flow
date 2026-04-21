import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

const roleOptions = [
  { label: "Donor", value: "donor" },
  { label: "Volunteer", value: "volunteer" },
  { label: "Admin", value: "admin" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { role = "donor" } = useParams();

  const apiBaseUrl = "http://localhost:5000/api/auth";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      const from = location.state?.from;
      const action = location.state?.action;
      if (from) {
        const separator = from.includes("?") ? "&" : "?";
        const nextUrl = action
          ? `${from}${separator}continued=${encodeURIComponent(action)}`
          : from;
        navigate(nextUrl, { replace: true });
        return;
      }
      navigate(`/dashboard/${data.user.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-badge">{role.toUpperCase()} Login</div>
        <h1>Welcome back</h1>
        <p>Sign in to continue managing donations and requests.</p>

        <div className="role-switcher">
          {roleOptions.map((option) => (
            <Link
              key={option.value}
              to={`/login/${option.value}`}
              className={
                option.value === role
                  ? "role-switcher__item role-switcher__item--active"
                  : "role-switcher__item"
              }
            >
              {option.label}
            </Link>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: 8 }}
            >
              🩸 Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="auth-input"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor="password"
              style={{ display: "block", marginBottom: 8 }}
            >
              🩸 Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="auth-input"
            />
          </div>

          <div className="auth-hint">
            Logging in as <strong>{role}</strong>
          </div>

          {error && <div className="form-alert form-alert--error">{error}</div>}

          <button type="submit" disabled={loading} className="primary-button">
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="auth-links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <Link to="/">Already have account?</Link>
          </div>
        </form>
      </section>
    </div>
  );
}
