import { useLocation, useNavigate } from "react-router-dom";

export default function useAuthAction() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const requireAuth = (action, continueTo) => {
    if (user && token) {
      return true;
    }

    navigate("/login/donor", {
      state: {
        from: continueTo || `${location.pathname}${location.search}`,
        action,
      },
    });
    return false;
  };

  return {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    requireAuth,
  };
}
