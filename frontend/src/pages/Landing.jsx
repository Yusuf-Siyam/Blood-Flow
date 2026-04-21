import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
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
          </div>
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
    </div>
  );
};

export default Landing;
