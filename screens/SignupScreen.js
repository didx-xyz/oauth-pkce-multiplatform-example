import { useContext, useState } from "react";
import AuthContent from "../components/Auth/AuthContent";
import { createUser } from "../util/auth";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { Alert } from "react-native";
import { AuthContext } from "../store/authContext";

function SignupScreen() {
  const [loadingAuth, setLoadingAuth] = useState(false);
  const authCtx = useContext(AuthContext);

  async function signupHandler({ email, password }) {
    setLoadingAuth(true);
    try {
      const token = await createUser(email, password);
      authCtx.authenticate(token);
      setLoadingAuth(false);
    } catch (error) {
      Alert.alert(
        "Authentication Failed",
        "Problem creating user. Please try again."
      );
      setLoadingAuth(false);
    }
  }

  if (loadingAuth) {
    return <LoadingOverlay message={"Creating User..."} />;
  }

  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;
