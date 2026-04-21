import { useState } from "react";
import { FaMapMarkerAlt, FaSearch, FaTint } from "react-icons/fa";
import "./SearchDonors.css";

const donors = [
  { name: "Siyam", bloodType: "A+", location: "Dhaka", available: true },
  { name: "johir", bloodType: "B+", location: "Chittagong", available: false },
  { name: "Arif", bloodType: "O-", location: "Sylhet", available: true },
  { name: "Salma", bloodType: "AB+", location: "Rajshahi", available: true },
  { name: "Korim", bloodType: "A-", location: "Khulna", available: false },
  { name: "Jahanara", bloodType: "B-", location: "Barisal", available: true },
];

const SearchDonors = () => {
  const [bloodType, setBloodType] = useState("");
  const [location, setLocation] = useState("");
  const [filteredDonors, setFilteredDonors] = useState(donors);

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = donors.filter((donor) => {
      return (
        (bloodType === "" ||
          donor.bloodType.toLowerCase() === bloodType.toLowerCase()) &&
        (location === "" ||
          donor.location.toLowerCase().includes(location.toLowerCase()))
      );
    });
    setFilteredDonors(filtered);
  };

  return (
    <div className="search-donors-container">
      <div className="search-donors-header">
        <h1 className="search-donors-title">Search for Blood Donors</h1>
        <p className="search-donors-subtitle">
          Find available donors in your area when you need them the most.
        </p>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-group">
          <div className="input-wrapper">
            <FaTint className="input-icon" />
            <input
              type="text"
              placeholder="Blood Type (e.g., A+)"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="input-wrapper">
            <FaMapMarkerAlt className="input-icon" />
            <input
              type="text"
              placeholder="Location (e.g., Dhaka)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <button type="submit" className="search-button">
          <FaSearch />
          Search
        </button>
      </form>

      <div className="donor-results-grid">
        {filteredDonors.length > 0 ? (
          filteredDonors.map((donor, index) => (
            <div key={index} className="donor-card">
              <div className="donor-card-header">
                <h3 className="donor-name">{donor.name}</h3>
                <span
                  className={`availability-badge ${donor.available ? "available" : "unavailable"}`}
                >
                  {donor.available ? "Available" : "Unavailable"}
                </span>
              </div>
              <div className="donor-card-body">
                <p className="donor-info">
                  <FaTint className="donor-info-icon" />
                  Blood Type: <strong>{donor.bloodType}</strong>
                </p>
                <p className="donor-info">
                  <FaMapMarkerAlt className="donor-info-icon" />
                  Location: <strong>{donor.location}</strong>
                </p>
              </div>
              <div className="donor-card-footer">
                <button
                  className="contact-donor-btn"
                  disabled={!donor.available}
                >
                  Contact Donor
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results-message">
            No donors found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchDonors;
