import { useEffect, useMemo, useState } from "react";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import useAuthAction from "../hooks/useAuthAction";
import "./DonationRequests.css";

const requests = [
  {
    id: "rq-01",
    bloodType: "AB+",
    date: "2026-02-16",
    recipient: "johir",
    location: "Dhaka, Agailjhara",
    time: "3:02 AM",
    urgency: "critical",
    phone: "01711123456",
    hospital: "Apollo Hospital",
    details: "2 units needed for emergency surgery",
  },
  {
    id: "rq-02",
    bloodType: "A+",
    date: "2026-01-18",
    recipient: "Xantha Mcintosh",
    location: "Feni, Patiya",
    time: "2:04 AM",
    urgency: "normal",
    phone: "01711123567",
    hospital: "Feni General Hospital",
    details: "1 unit needed for postpartum patient",
  },
  {
    id: "rq-03",
    bloodType: "O-",
    date: "2026-01-08",
    recipient: "Arif",
    location: "Dhaka, Dhanmondi",
    time: "2:20 PM",
    urgency: "critical",
    phone: "01711124678",
    hospital: "Popular Hospital",
    details: "Immediate transfusion needed after trauma",
  },
  {
    id: "rq-04",
    bloodType: "A+",
    date: "2026-01-03",
    recipient: "Salma",
    location: "Rajshahi, Boalia",
    time: "3:00 PM",
    urgency: "normal",
    phone: "01711125789",
    hospital: "Rajshahi Medical College",
    details: "Scheduled surgery support",
  },
  {
    id: "rq-05",
    bloodType: "B-",
    date: "2026-01-01",
    recipient: "Jahanara",
    location: "Barisal, Bakerganj",
    time: "8:00 AM",
    urgency: "high",
    phone: "01711126890",
    hospital: "Sher-e-Bangla Medical",
    details: "Urgent maternity ward request",
  },
  {
    id: "rq-06",
    bloodType: "A+",
    date: "2025-12-25",
    recipient: "Korim Uddin",
    location: "Dhaka, Savar",
    time: "10:00 AM",
    urgency: "normal",
    phone: "01711127901",
    hospital: "Enam Medical College",
    details: "Planned transfusion for anemia",
  },
];

const DonationRequests = () => {
  const { requireAuth, isAuthenticated } = useAuthAction();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId),
    [selectedRequestId],
  );

  const handleViewDetails = (request) => {
    const continueTo = `/donation-requests?request=${request.id}`;
    const allow = requireAuth("view-details", continueTo);
    if (!allow) return;
    setSelectedRequestId(request.id);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("request", request.id);
    setSearchParams(nextParams);
  };

  useEffect(() => {
    const continued = searchParams.get("continued");
    const requestId = searchParams.get("request");
    if (!isAuthenticated || !requestId) return;

    if (continued === "view-details" || selectedRequestId !== requestId) {
      setSelectedRequestId(requestId);
    }
  }, [isAuthenticated, searchParams, selectedRequestId]);

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
                <div className="meta-item">
                  <span
                    className={
                      request.urgency === "critical"
                        ? "urgency-chip urgency-chip--critical"
                        : "urgency-chip"
                    }
                  >
                    {request.urgency.toUpperCase()}
                  </span>
                </div>
                <div className="meta-item locked-row">
                  <span>Phone: 🔒 Login Required</span>
                </div>
                <div className="meta-item locked-row">
                  <span>Hospital: 🔒 Login Required</span>
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

      {selectedRequest && isAuthenticated && (
        <section className="details-panel">
          <h2>Full Request Details</h2>
          <p>
            <strong>Recipient:</strong> {selectedRequest.recipient}
          </p>
          <p>
            <strong>Phone:</strong> {selectedRequest.phone}
          </p>
          <p>
            <strong>Hospital:</strong> {selectedRequest.hospital}
          </p>
          <p>
            <strong>Need:</strong> {selectedRequest.details}
          </p>
        </section>
      )}
    </div>
  );
};

export default DonationRequests;
