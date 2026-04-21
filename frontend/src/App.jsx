import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import MainLayout from "./components/MainLayout";
import Blogs from "./pages/Blogs";
import Dashboard from "./pages/Dashboard";
import DonationRequests from "./pages/DonationRequests";
import ForgotPassword from "./pages/ForgotPassword";
import Funding from "./pages/Funding";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import MyDonations from "./pages/MyDonations";
import MyRequests from "./pages/MyRequests";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Rewards from "./pages/Rewards";
import SearchDonors from "./pages/SearchDonors";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/donation-requests" element={<DonationRequests />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/search-donors" element={<SearchDonors />} />
          <Route path="/funding" element={<Funding />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard/:role" element={<Dashboard />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/my-donations" element={<MyDonations />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="*" element={<Landing />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
