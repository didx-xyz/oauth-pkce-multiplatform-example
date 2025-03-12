import { useState } from "react";
import { StyleSheet, View } from "react-native";

import Button from "../ui/Button";
import Input from "./Input";
import OAuthButton from "../ui/OAuthButton";
import { signInAsync } from "../../util/oAuth/oAuthPkce";
import { useContext } from "react";
import { AuthContext } from "../../store/authContext";
import { Alert } from "react-native";

function AuthForm({ isLogin, onSubmit, credentialsInvalid }) {
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredConfirmEmail, setEnteredConfirmEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredConfirmPassword, setEnteredConfirmPassword] = useState("");

  const authCtx = useContext(AuthContext);

  const {
    email: emailIsInvalid,
    confirmEmail: emailsDontMatch,
    password: passwordIsInvalid,
    confirmPassword: passwordsDontMatch,
  } = credentialsInvalid;

  function updateInputValueHandler(inputType, enteredValue) {
    switch (inputType) {
      case "email":
        setEnteredEmail(enteredValue);
        break;
      case "confirmEmail":
        setEnteredConfirmEmail(enteredValue);
        break;
      case "password":
        setEnteredPassword(enteredValue);
        break;
      case "confirmPassword":
        setEnteredConfirmPassword(enteredValue);
        break;
    }
  }

  function submitHandler() {
    onSubmit({
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
      confirmPassword: enteredConfirmPassword,
    });
  }

  async function oAuthLoginHandler() {
    try {
      const tokenResult = await signInAsync();
      if (tokenResult.access_token) {
        authCtx.authenticate(tokenResult.access_token);
      } else {
        Alert.alert(
          "OAuth Login Failed",
          "Problem logging in with OAuth. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "OAuth Login Failed",
        "Problem logging in with OAuth. Please try again."
      );
    }
  }

  return (
    <View style={styles.form}>
      <View>
        <Input
          label="Email Address"
          onUpdateValue={updateInputValueHandler.bind(this, "email")}
          value={enteredEmail}
          keyboardType="email-address"
          isInvalid={emailIsInvalid}
        />
        {!isLogin && (
          <Input
            label="Confirm Email Address"
            onUpdateValue={updateInputValueHandler.bind(this, "confirmEmail")}
            value={enteredConfirmEmail}
            keyboardType="email-address"
            isInvalid={emailsDontMatch}
          />
        )}
        <Input
          label="Password"
          onUpdateValue={updateInputValueHandler.bind(this, "password")}
          secure
          value={enteredPassword}
          isInvalid={passwordIsInvalid}
        />
        {!isLogin && (
          <Input
            label="Confirm Password"
            onUpdateValue={updateInputValueHandler.bind(
              this,
              "confirmPassword"
            )}
            secure
            value={enteredConfirmPassword}
            isInvalid={passwordsDontMatch}
          />
        )}
        <View style={styles.buttons}>
          <View style={styles.button}>
            <Button onPress={submitHandler}>
              {isLogin
                ? "Log In (Direct)"
                : "Sign Up with Firebase (Direct ToDo)"}
            </Button>
          </View>
          <View style={styles.button}>
            {isLogin && <OAuthButton onPress={oAuthLoginHandler} />}
          </View>
        </View>
      </View>
    </View>
  );
}

export default AuthForm;

const styles = StyleSheet.create({
  buttons: {
    marginTop: 12,
  },
  button: {
    paddingVertical: 6,
  },
});
