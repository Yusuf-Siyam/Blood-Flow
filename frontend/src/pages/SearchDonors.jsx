import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaSearch, FaTint } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import useAuthAction from "../hooks/useAuthAction";
import "./SearchDonors.css";

const donors = [
  {
    name: "Siyam",
    bloodType: "A+",
    district: "Dhaka",
    location: "Mirpur",
    available: true,
  },
  {
    name: "johir",
    bloodType: "B+",
    district: "Chattogram",
    location: "Patiya",
    available: false,
  },
  {
    name: "Arif",
    bloodType: "O-",
    district: "Sylhet",
    location: "Zindabazar",
    available: true,
  },
  {
    name: "Salma",
    bloodType: "AB+",
    district: "Rajshahi",
    location: "Boalia",
    available: true,
  },
  {
    name: "Korim",
    bloodType: "A-",
    district: "Khulna",
    location: "Sonadanga",
    available: false,
  },
  {
    name: "Jahanara",
    bloodType: "B-",
    district: "Barishal",
    location: "Bakerganj",
    available: true,
  },
];

const SearchDonors = () => {
  const { requireAuth, isAuthenticated } = useAuthAction();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bloodType, setBloodType] = useState("");
  const [district, setDistrict] = useState("");
  const [availability, setAvailability] = useState("all");
  const [filteredDonors, setFilteredDonors] = useState(donors);
  const [contactingDonor, setContactingDonor] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = donors.filter((donor) => {
      return (
        (bloodType === "" ||
          donor.bloodType.toLowerCase() === bloodType.toLowerCase()) &&
        (district === "" ||
          donor.district.toLowerCase().includes(district.toLowerCase())) &&
        (availability === "all" ||
          donor.available === (availability === "available"))
      );
    });
    setFilteredDonors(filtered);
  };

  const handleContact = (donor) => {
    const continueTo = `/search-donors?donor=${encodeURIComponent(donor.name)}`;
    const allow = requireAuth("contact-donor", continueTo);
    if (!allow) return;
    setContactingDonor(donor.name);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("donor", donor.name);
    setSearchParams(nextParams);
  };

  useEffect(() => {
    const continued = searchParams.get("continued");
    const donorName = searchParams.get("donor");
    if (!isAuthenticated || !donorName) return;
    if (continued === "contact-donor" || contactingDonor !== donorName) {
      setContactingDonor(donorName);
    }
  }, [searchParams, isAuthenticated, contactingDonor]);

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
              placeholder="District (e.g., Dhaka)"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="input-wrapper">
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="search-input search-select"
            >
              <option value="all">All Availability</option>
              <option value="available">Only Available</option>
              <option value="unavailable">Only Unavailable</option>
            </select>
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
                  District: <strong>{donor.district}</strong>
                </p>
                <p className="donor-info">
                  <FaMapMarkerAlt className="donor-info-icon" />
                  Area: <strong>{donor.location}</strong>
                </p>
              </div>
              <div className="donor-card-footer">
                <button
                  className="contact-donor-btn"
                  disabled={!donor.available}
                  onClick={() => handleContact(donor)}
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

      {contactingDonor && isAuthenticated && (
        <div className="contact-panel">
          <h2>Contact Access Granted</h2>
          <p>
            You can now contact <strong>{contactingDonor}</strong>. In a
            production build this opens secure contact details.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchDonors;
