import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const guestLinks = [
  { label: "Home", to: "/" },
  { label: "Donation Requests", to: "/donation-requests" },
  { label: "Blogs", to: "/blogs" },
  { label: "Search Donors", to: "/search-donors" },
  { label: "Funding", to: "/funding" },
];

const notifications = [
  "New urgent request near your location",
  "Request accepted by volunteer",
  "Donation marked completed",
  "Reward badge earned",
];

export default function Navbar() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAuthenticated = Boolean(localStorage.getItem("token") && user);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="top-nav-wrap">
      <div className="top-nav">
        <Link to="/" className="brand-logo">
          <span>🩸</span> BloodFlow
        </Link>

        <nav className="top-links">
          {guestLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        {!isAuthenticated ? (
          <div className="top-actions">
            <Link className="top-button top-button--ghost" to="/login/donor">
              Login
            </Link>
            <Link className="top-button" to="/register">
              Join Now
            </Link>
          </div>
        ) : (
          <div className="top-actions">
            <div className="dropdown-wrap">
              <button
                className="top-icon-btn"
                onClick={() => {
                  setShowNotifications((v) => !v);
                  setShowProfile(false);
                }}
              >
                🔔
              </button>
              {showNotifications && (
                <div className="dropdown-menu dropdown-menu--notify">
                  {notifications.map((item) => (
                    <button
                      key={item}
                      className="dropdown-item"
                      onClick={() => setShowNotifications(false)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="dropdown-wrap">
              <button
                className="top-button top-button--ghost"
                onClick={() => {
                  setShowProfile((v) => !v);
                  setShowNotifications(false);
                }}
              >
                {user.name?.split(" ")[0] || "Profile"}
              </button>
              {showProfile && (
                <div className="dropdown-menu">
                  <Link
                    to={`/dashboard/${user.role}`}
                    className="dropdown-item"
                    onClick={() => setShowProfile(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my-requests"
                    className="dropdown-item"
                    onClick={() => setShowProfile(false)}
                  >
                    My Requests
                  </Link>
                  <Link
                    to="/my-donations"
                    className="dropdown-item"
                    onClick={() => setShowProfile(false)}
                  >
                    My Donations
                  </Link>
                  <Link
                    to="/rewards"
                    className="dropdown-item"
                    onClick={() => setShowProfile(false)}
                  >
                    Rewards
                  </Link>
                  <button className="dropdown-item" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
