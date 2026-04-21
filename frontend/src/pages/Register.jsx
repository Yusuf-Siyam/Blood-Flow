import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    bloodGroup: "O+",
    location: "",
    password: "",
    role: "donor",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [createdUser, setCreatedUser] = useState(null);

  const apiBaseUrl = "http://localhost:5000/api/auth";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setCreatedUser(null);

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!form.location.trim()) {
      setError("Location is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          number: form.number.trim(),
          bloodGroup: form.bloodGroup.trim(),
          location: form.location.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess("Registration successful! You can now login.");
      setCreatedUser(data.user || null);
      setForm({
        name: "",
        email: "",
        number: "",
        bloodGroup: "O+",
        location: "",
        password: "",
        role: "donor",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-badge">Create account</div>
        <h1>Register</h1>
        <p>
          Join the blood donation network with your contact and location
          details.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            🩸 Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </label>

          <label>
            🩸 Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </label>

          <label>
            🩸 Number
            <input
              name="number"
              type="tel"
              value={form.number}
              onChange={handleChange}
              required
              placeholder="017xxxxxxxx"
              className="auth-input"
            />
          </label>

          <label>
            🩸 Blood Group
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              className="auth-input"
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
            🩸 Location
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="Your city or area"
              className="auth-input"
            />
          </label>

          <label>
            🩸 Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </label>

          <label>
            🩸 Role
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="auth-input"
            >
              <option value="donor">Donor</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </label>

          {error && <div className="form-alert form-alert--error">{error}</div>}
          {success && (
            <div className="form-alert form-alert--success">{success}</div>
          )}
          {createdUser && (
            <div className="user-summary user-summary--success">
              <div>
                <strong>Saved in database:</strong>
              </div>
              <div>Name: {createdUser.name}</div>
              <div>Email: {createdUser.email}</div>
              <div>Number: {createdUser.number}</div>
              <div>Blood Group: {createdUser.bloodGroup}</div>
              <div>Location: {createdUser.location}</div>
              <div>Role: {createdUser.role}</div>
            </div>
          )}

          <button type="submit" disabled={loading} className="primary-button">
            {loading ? "Registering..." : "Register"}
          </button>
          <p className="auth-footer">
            Already have an account? <Link to="/login/donor">Login here</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
