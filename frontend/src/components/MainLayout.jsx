import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function MainLayout() {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="site-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
