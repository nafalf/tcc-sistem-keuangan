import { Navigate } from "react-router-dom";
import { getCookie } from "../utils/cookieUtils";

const PrivateRoute = ({ children }) => {
  const token = getCookie("accessToken");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
