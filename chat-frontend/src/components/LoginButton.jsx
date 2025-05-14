import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      sessionStorage.setItem("userEmail", user.email);
      console.log("User email set in session storage:", user.email);
    }
  }, [isAuthenticated, user]);
  // Check if user is authenticated and has an email
  // If not, redirect to login page
  if (!isAuthenticated) {
    return (
      <div className="center-button">
        <button
          className="btn btn-primary loginBtn"
          onClick={() => loginWithRedirect()}
        >
          Log In
        </button>
      </div>
    );
  }
  return null;
};

export default LoginButton;
