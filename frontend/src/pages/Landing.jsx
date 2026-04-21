import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthAction from "../hooks/useAuthAction";
import "./Landing.css";

const stats = [
  { label: "Lives Saved", value: "12,480" },
  { label: "Active Donors", value: "3,420" },
  { label: "Donations", value: "8,905" },
  { label: "Requests", value: "1,132" },
];

const leaderboard = [
  { name: "Siyam Rahman", group: "A+", count: 28 },
  { name: "Farzana Akter", group: "O-", count: 24 },
  { name: "Arif Hossain", group: "B+", count: 21 },
];

const urgentRequests = [
  {
    bloodGroup: "O-",
    patient: "Nafisa",
    district: "Dhaka",
    hospital: "Square Hospital",
    urgency: "Critical",
  },
  {
    bloodGroup: "AB+",
    patient: "Jamal",
    district: "Chattogram",
    hospital: "Chattogram Medical",
    urgency: "High",
  },
];

const nearbyHotspots = [
  {
    area: "Dhanmondi, Dhaka",
    blood: "O-",
    note: "Critical trauma unit demand",
    mapUrl:
      "https://www.openstreetmap.org/?mlat=23.7465&mlon=90.3760#map=14/23.7465/90.3760",
  },
  {
    area: "Patiya, Chattogram",
    blood: "AB+",
    note: "Maternity emergency demand",
    mapUrl:
      "https://www.openstreetmap.org/?mlat=22.2950&mlon=91.9780#map=13/22.2950/91.9780",
  },
  {
    area: "Boalia, Rajshahi",
    blood: "B-",
    note: "Surgery support demand",
    mapUrl:
      "https://www.openstreetmap.org/?mlat=24.3745&mlon=88.6042#map=13/24.3745/88.6042",
  },
];

const Landing = () => {
  const { requireAuth } = useAuthAction();
  const navigate = useNavigate();
  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    [],
  );

  const handleRequestBlood = () => {
    const allow = requireAuth("request-blood", "/dashboard/donor");
    if (!allow) return;
    navigate("/dashboard/donor?continued=request-blood");
  };

  const handleAcceptUrgent = () => {
    const allow = requireAuth("accept-request", "/dashboard/donor");
    if (!allow) return;
    navigate("/dashboard/donor?continued=accept-request");
  };

  return (
    <div className="landing-container">
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Give Blood, Give Hope</h1>
          <p className="hero-subtitle">
            A single donation can save multiple lives. Be the reason someone
            gets a second chance today.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Join as a Donor
            </Link>
            <Link to="/search-donors" className="btn btn-secondary">
              Search Donors
            </Link>
            <button
              type="button"
              className="btn btn-tertiary"
              onClick={handleRequestBlood}
            >
              Request Blood
            </button>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <h2>Live Platform Stats</h2>
        <div className="stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="map-section">
        <h2>Nearby Location Pulse</h2>
        <p>Live location context for urgent blood demand across major zones.</p>
        <div className="map-layout">
          <iframe
            title="BloodFlow Nearby Map"
            className="nearby-map-frame"
            loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=87.4%2C20.5%2C92.8%2C26.5&layer=mapnik&marker=23.8103%2C90.4125"
          ></iframe>
          <div className="hotspot-list">
            {nearbyHotspots.map((spot) => (
              <article key={spot.area} className="hotspot-card">
                <div className="hotspot-top">
                  <span>{spot.blood}</span>
                  <strong>{spot.area}</strong>
                </div>
                <p>{spot.note}</p>
                <a href={spot.mapUrl} target="_blank" rel="noreferrer">
                  Open exact location
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="steps-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <article>
            <span>1</span>
            <h3>Create or Login Account</h3>
            <p>Join as donor, volunteer, or admin and verify your profile.</p>
          </article>
          <article>
            <span>2</span>
            <h3>Match by Area and Blood Group</h3>
            <p>
              Search donors and requests with urgency and availability filters.
            </p>
          </article>
          <article>
            <span>3</span>
            <h3>Respond and Save Lives</h3>
            <p>
              Contact, accept, and complete donations with a secure workflow.
            </p>
          </article>
        </div>
      </section>

      <section className="urgent-section">
        <div className="section-head">
          <h2>Urgent Requests</h2>
          <button type="button" onClick={handleAcceptUrgent}>
            Accept Request
          </button>
        </div>
        <div className="urgent-grid">
          {urgentRequests.map((request, index) => (
            <article
              key={`${request.patient}-${index}`}
              className="urgent-card"
            >
              <div className="urgent-top-row">
                <span className="urgent-blood">{request.bloodGroup}</span>
                <span className="urgent-level">{request.urgency}</span>
              </div>
              <h3>{request.patient}</h3>
              <p>
                {request.hospital}, {request.district}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="leaderboard-section">
        <h2>Top Donor Leaderboard</h2>
        <div className="leaderboard-table">
          {leaderboard.map((donor, index) => (
            <div key={donor.name} className="leader-row">
              <span>#{index + 1}</span>
              <strong>{donor.name}</strong>
              <p>{donor.group}</p>
              <span>{donor.count} donations</span>
            </div>
          ))}
        </div>
      </section>

      <section className="support-section">
        <h2 className="support-title">Why Support Blood Donation?</h2>
        <div className="support-separator"></div>
        <div className="support-grid">
          <div className="support-card">
            <h3>Save Lives</h3>
            <p>
              Your blood can be a lifeline for patients in critical condition,
              including accident victims, surgery patients, and those with
              chronic illnesses.
            </p>
          </div>
          <div className="support-card">
            <h3>Community Well-being</h3>
            <p>
              A healthy and available blood supply is a cornerstone of a
              resilient community. Your donation strengthens our collective
              health.
            </p>
          </div>
          <div className="support-card">
            <h3>Personal Health Benefits</h3>
            <p>
              Regular blood donation can lead to health benefits, including
              reduced iron levels and a free health check-up before every
              donation.
            </p>
          </div>
        </div>
      </section>

      {currentUser && (
        <section className="welcome-back-strip">
          <p>
            Welcome back, {currentUser.name}. Continue from your dashboard for
            secure actions.
          </p>
          <Link to={`/dashboard/${currentUser.role}`}>Open Dashboard</Link>
        </section>
      )}
    </div>
  );
};

export default Landing;
