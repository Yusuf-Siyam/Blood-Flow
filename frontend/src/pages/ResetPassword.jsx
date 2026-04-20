import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setMessage(data.message || "Password updated successfully");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-badge">Set new password</div>
        <h1>Reset password</h1>
        <p>Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="auth-input"
            />
          </label>

          {error && <div className="form-alert form-alert--error">{error}</div>}
          {message && (
            <div className="form-alert form-alert--success">{message}</div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="primary-button"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login/donor">Back to login</Link>
        </p>
      </section>
    </div>
  );
}
