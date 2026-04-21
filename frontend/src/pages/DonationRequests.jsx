import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import "./DonationRequests.css";

const requests = [
  {
    bloodType: "AB+",
    date: "2026-02-16",
    recipient: "johir",
    location: "Dhaka, Agailjhara",
    time: "3:02 AM",
  },
  {
    bloodType: "A+",
    date: "2026-01-18",
    recipient: "Xantha Mcintosh",
    location: "Feni, Patiya",
    time: "2:04 AM",
  },
  {
    bloodType: "O-",
    date: "2026-01-08",
    recipient: "Arif",
    location: "Dhaka, Dhanmondi",
    time: "2:20 PM",
  },
  {
    bloodType: "A+",
    date: "2026-01-03",
    recipient: "Salma",
    location: "Rajshahi, Boalia",
    time: "3:00 PM",
  },
  {
    bloodType: "B-",
    date: "2026-01-01",
    recipient: "Jahanara",
    location: "Barisal, Bakerganj",
    time: "8:00 AM",
  },
  {
    bloodType: "A+",
    date: "2025-12-25",
    recipient: "Korim Uddin",
    location: "Dhaka, Savar",
    time: "10:00 AM",
  },
];

const DonationRequests = () => {
  const handleViewDetails = (request) => {
    // In a real app, you would use the useAuthAction hook here
    // to ensure the user is logged in before showing details.
    alert(`Viewing details for ${request.recipient}'s request.`);
  };

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h1 className="requests-title">Pending Donation Requests</h1>
        <p className="requests-subtitle">
          Heroism is in your blood. Browse the requests below and help someone
          in their critical time.
        </p>
        <div className="requests-separator"></div>
      </div>
      <div className="requests-grid">
        {requests.map((request, index) => (
          <div key={index} className="request-card">
            <div className="request-card-header">
              <span className="blood-type-badge">{request.bloodType}</span>
              <span className="request-date">{request.date}</span>
            </div>
            <div className="request-card-body">
              <p className="recipient-info">
                Recipient:{" "}
                <span className="recipient-name">{request.recipient}</span>
              </p>
              <div className="request-meta">
                <div className="meta-item">
                  <FaMapMarkerAlt className="meta-icon" />
                  <span>{request.location}</span>
                </div>
                <div className="meta-item">
                  <FaClock className="meta-icon" />
                  <span>{request.time}</span>
                </div>
              </div>
            </div>
            <div className="request-card-footer">
              <button
                onClick={() => handleViewDetails(request)}
                className="view-details-btn"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationRequests;
