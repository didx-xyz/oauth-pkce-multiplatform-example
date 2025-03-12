import * as WebBrowser from "expo-web-browser";
import { getRandomBytesAsync } from "expo-random";
import CryptoJS from "crypto-js";
import { Platform } from "react-native";

// OAuth 2.0 PKCE Flow
// +-----------------+          +-----------------+
// |     Client      |          |   Auth Server   |
// | (Web or Native) |          |    (Auth0)      |
// +-----------------+          +-----------------+
//           |                           |
//           | 1. Generate Code Verifier |
//           |                           |
//           | 2. Generate Code Challenge|
//           |                           |
//           | 3. Send Authorization     |
//           |    Request (with code_challenge)
//           |------------------------->|
//           |                           |
//           | 4. User Authenticates     |
//           |    (via popup or redirect)|
//           |                           |
//           | 5. Receive Authorization  |
//           |    Code (via redirect)    |
//           |<-------------------------|
//           |                           |
//           | 6. Exchange Code for Token|
//           |    (with code_verifier)   |
//           |------------------------->|
//           |                           |
//           | 7. Receive Access Token   |
//           |<-------------------------|
//           |                           |
//           | 8. Use Token for API Calls|
//           |                           |
// +-----------------+          +-----------------+

async function generateCodeChallenge(codeVerifier) {
  const hash = CryptoJS.SHA256(codeVerifier);
  const base64Digest = CryptoJS.enc.Base64.stringify(hash);
  return base64Digest
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateRandomString(length) {
  if (Platform.OS === "web") {
    return window.crypto
      .getRandomValues(new Uint8Array(length))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")
      .slice(0, length);
  }
  const randomBytes = await getRandomBytesAsync(length);
  return [...randomBytes]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

async function signInAsync() {
  const redirectUrl =
    Platform.OS === "web" ? "http://localhost:8081/" : "userauth2://redirect";
  const authUrl = `http://keycloak.127.0.0.1.nip.io/auth/realms/mobile/protocol/openid-connect/auth`;
  const tokenUrl =
    "http://keycloak.127.0.0.1.nip.io/auth/realms/mobile/protocol/openid-connect/token";
  const clientId = "vfLsrbS8wJ9V7vJt8fzsAo0APuf1kPdn";

  // const authUrl = `https://dev-e8123jjkg2584hsj.us.auth0.com/authorize`;
  // const tokenUrl = "https://dev-e8123jjkg2584hsj.us.auth0.com/oauth/token";
  // const clientId = "vfLsrbS8wJ9V7vJt8fzsAo0APuf1kPdn";

  const codeVerifier = await generateRandomString(128);
  console.log("Code Verifier:", codeVerifier);

  const codeChallenge = await generateCodeChallenge(codeVerifier);
  console.log("Code Challenge:", codeChallenge);

  // Add prompt=login to force Auth0 login screen (optional, for testing)
  const authRequestUrl = `${authUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUrl}&code_challenge=${codeChallenge}&code_challenge_method=S256&prompt=login`;
  console.log("Auth Request URL:", authRequestUrl);

  let result;

  if (Platform.OS === "web") {
    // Web-specific flow: Open a popup
    console.log("Auth Request URL:", authRequestUrl);
    try {
      new URL(authRequestUrl);
      console.log("URL is valid");
    } catch (e) {
      console.error("Invalid URL:", e.message);
    }
    const popup = window.open(
      authRequestUrl,
      "auth0_login",
      "width=500,height=600"
    );
    console.log("Past line 87");
    if (!popup) {
      console.error("Popup blocked. Please allow popups and try again.");
      return { type: "error", error: "Popup blocked" };
    }

    // Poll for redirect
    result = await new Promise((resolve) => {
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          resolve({ type: "dismiss" });
        }
        try {
          const popupUrl = popup.location.href;
          console.log("Popup URL:", popupUrl); // Debug popup navigation
          if (popupUrl.startsWith(redirectUrl)) {
            const url = new URL(popupUrl);
            clearInterval(checkPopup);
            popup.close();
            resolve({ type: "success", url: url.toString() });
          }
        } catch (e) {
          // Cross-origin errors expected until redirect
        }
      }, 500);
    });
  } else {
    // Native (Android) flow
    result = await WebBrowser.openAuthSessionAsync(authRequestUrl, redirectUrl);
  }

  console.log("Result:", result);

  if (result.type === "success" && result.url) {
    const url = new URL(result.url);
    const code = url.searchParams.get("code");

    console.log("Code:", code);
    console.log("Redirect URI:", redirectUrl);

    const tokenRequestBody = `grant_type=authorization_code&client_id=${encodeURIComponent(
      clientId
    )}&code_verifier=${encodeURIComponent(
      codeVerifier
    )}&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(
      redirectUrl
    )}`;

    console.log("Token Request Body:", tokenRequestBody);

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenRequestBody,
    });

    console.log("Token Response Status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorResponse = await tokenResponse.text();
      console.error("Token Response Error:", errorResponse);
    }

    const tokenResult = await tokenResponse.json();
    console.log("Token Result:", tokenResult);
    return tokenResult;
  } else {
    console.error("Authorization failed or was dismissed:", result);
    return result;
  }
}

export { generateCodeChallenge, generateRandomString, signInAsync };
