import { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submitNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setMessage("Thanks. You are subscribed to updates.");
    setEmail("");
  };

  return (
    <footer className="site-footer">
      <div className="emergency-banner">
        🚨 Emergency? Call 999 immediately.
      </div>

      <div className="footer-grid">
        <div>
          <h4>Quick Links</h4>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/donation-requests">Requests</Link>
            <Link to="/search-donors">Search Donors</Link>
            <Link to="/funding">Funding</Link>
          </div>
        </div>

        <div>
          <h4>Contact</h4>
          <p>Email: support@bloodflow.local</p>
          <p>Phone: +880 1711 000000</p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">
              YouTube
            </a>
          </div>
        </div>

        <div>
          <h4>Newsletter</h4>
          <form onSubmit={submitNewsletter} className="newsletter-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          {message && <p className="newsletter-success">{message}</p>}
        </div>
      </div>

      <p className="footer-copy">
        © {new Date().getFullYear()} BloodFlow. Save lives through fast
        coordination.
      </p>
    </footer>
  );
}
