import { useContext, useState } from "react";
import AuthContent from "../components/Auth/AuthContent";
import { login } from "../util/authDirectAccess";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { Alert } from "react-native";
import { AuthContext } from "../store/authContext";

function LoginScreen() {
  const [loadingAuth, setLoadingAuth] = useState(false);

  const authCtx = useContext(AuthContext);

  async function loginHandler({ email, password }) {
    setLoadingAuth(true);
    try {
      const token = await login(email, password);
      authCtx.authenticate(token);
      setLoadingAuth(false);
    } catch (error) {
      Alert.alert(
        "Authentication Failed",
        "Problem logging in. Please try again."
      );
      setLoadingAuth(false);
    }
  }

  if (loadingAuth) {
    return <LoadingOverlay message={"Logging in..."} />;
  }

  return <AuthContent isLogin onAuthenticate={loginHandler} />;
}

export default LoginScreen;
