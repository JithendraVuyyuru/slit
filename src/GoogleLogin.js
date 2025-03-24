import React, { useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppContext } from "./App";

const GoogleLoginComponent = () => {
  const { setSystemMessage, fetchFitnessData } = useContext(AppContext);

  return (
    <GoogleOAuthProvider clientId="770703155610-86rbnsqifhbi0hkr38ksqj7inr2e2lev.apps.googleusercontent.com">
      <div>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            localStorage.setItem("google_token", credentialResponse.credential);
            setSystemMessage("System: Successfully signed in with Google!");
            fetchFitnessData();
          }}
          onError={() => {
            setSystemMessage("System: Google Sign-In failed.");
          }}
        />
        <p className="google-login-debug">If you don’t see the Google Sign-In button above, check the console for errors.</p>
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginComponent;