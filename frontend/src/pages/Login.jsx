import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: 8 }}
            >
              Email
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
              Password
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
