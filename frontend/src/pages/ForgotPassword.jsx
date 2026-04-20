import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setMessage(data.message || "Reset link generated");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-badge">Reset password</div>
        <h1>Forgot your password?</h1>
        <p>Enter your email and we will generate a reset link.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="auth-input"
            />
          </label>

          {error && <div className="form-alert form-alert--error">{error}</div>}
          {message && (
            <div className="form-alert form-alert--success">{message}</div>
          )}

          {message && (
            <div className="user-summary user-summary--success">
              Reset link will be sent to your inbox when SMTP is configured.
            </div>
          )}

          <button type="submit" disabled={loading} className="primary-button">
            {loading ? "Sending..." : "Reset link"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login/donor">Back to login</Link>
        </p>
      </section>
    </div>
  );
}
