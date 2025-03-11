import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  useProxy: false,
  scheme: "userauth2",
});

const auth0Domain = "dev-e8123jjkg2584hsj.us.auth0.com";
const clientId = "vfLsrbS8wJ9V7vJt8fzsAo0APuf1kPdn";

export function generateShortUUID() {
  return Math.random().toString(36).substring(2, 15);
}

export default function OAuthPkce() {
  const [accessToken, setAccessToken] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  const login = async () => {
    try {
      const state = generateShortUUID();
      // Get Authorization code
      console.log("Code:", state);
      console.log("Redirect URI:", redirectUri);
      const authRequestOptions = {
        responseType: AuthSession.ResponseType.Code,
        clientId,
        redirectUri: redirectUri,
        prompt: AuthSession.Prompt.Login,
        scopes: ["openid", "profile", "email", "offline_access"],
        state: state,
        usePKCE: true,
      };
      const authRequest = new AuthSession.AuthRequest(authRequestOptions);
      console.log("Auth Request:", authRequest);

      const discoveryResult = {
        authorizationEndpoint: `https://${auth0Domain}/authorize`,
        tokenEndpoint: `https://${auth0Domain}/oauth/token`,
      };

      const authorizeResult = await authRequest.promptAsync(discoveryResult, {
        useProxy: true,
      });

      console.log("Authorize Result:", authorizeResult);

      if (authorizeResult.type === "success") {
        // If successful, get tokens
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            code: authorizeResult.params.code,
            clientId: clientId,
            redirectUri: redirectUri,
            extraParams: {
              code_verifier: authRequest.codeVerifier || "",
            },
          },
          discoveryResult
        );

        setAccessToken(tokenResult.accessToken);
        setIdToken(tokenResult.idToken);
        setRefreshToken(tokenResult.refreshToken);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const refresh = async () => {
    // Implement refresh token logic here
  };

  const logout = async () => {
    // Implement logout logic here
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {refreshToken ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View>
            <ScrollView style={{ flex: 1 }}>
              <Text>AccessToken: {accessToken}</Text>
              {/* <Text>idToken: {idToken}</Text>
              <Text>refreshToken: {refreshToken}</Text> */}
            </ScrollView>
          </View>
          <View>
            {/* <Button title="Refresh" onPress={refresh} />
            <Button title="Logout" onPress={logout} /> */}
          </View>
        </View>
      ) : (
        <Button title="Login" onPress={login} />
      )}
    </View>
  );
}

// Original Code:

// import { useState } from "react";
// import {
//   ActivityIndicator,
//   Button,
//   ScrollView,
//   Text,
//   View,
// } from "react-native";
// import * as AuthSession from "expo-auth-session";
// import * as WebBrowser from "expo-web-browser";
// import { useEffect } from "react";

// WebBrowser.maybeCompleteAuthSession();
// const redirectUri = AuthSession.makeRedirectUri({
//   useProxy: true,
// });

// const keycloakUri = "";
// const keycloakRealm = "";
// const clientId = "";

// export function generateShortUUID() {
//   return Math.random().toString(36).substring(2, 15);
// }

// export default function OAuthPkce() {
//   const [accessToken, setAccessToken] = useState(null);
//   const [idToken, setIdToken] = useState(null);
//   const [refreshToken, setRefreshToken] = useState(null);

//   const login = async () => {
//     const state = generateShortUUID();
//     // Get Authorization code
//     console.log("Code:", state);
//     const authRequestOptions = {
//       responseType: AuthSession.ResponseType.Code,
//       clientId,
//       redirectUri: redirectUri,
//       prompt: AuthSession.Prompt.Login,
//       scopes: ["openid", "profile", "email", "offline_access"],
//       state: state,
//       usePKCE: true,
//     };
//     const authRequest = new AuthSession.AuthRequest(authRequestOptions);
//     const discoveryResult = await AuthSession.fetchDiscoveryAsync(
//       `${keycloakUri}/realms/${keycloakRealm}`
//     );
//     const authorizeResult = await authRequest.promptAsync(discoveryResult, {
//       useProxy: true,
//     });

//     if (authorizeResult.type === "success") {
//       // If successful, get tokens
//       const tokenResult = await AuthSession.exchangeCodeAsync(
//         {
//           code: authorizeResult.params.code,
//           clientId: clientId,
//           redirectUri: redirectUri,
//           extraParams: {
//             code_verifier: authRequest.codeVerifier || "",
//           },
//         },
//         discoveryResult
//       );

//       setAccessToken(tokenResult.accessToken);
//       setIdToken(tokenResult.idToken);
//       setRefreshToken(tokenResult.refreshToken);
//     }
//   };

//   const refresh = async () => {
//     // Implement refresh token logic here
//   };

//   const logout = async () => {
//     // Implement logout logic here
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       {refreshToken ? (
//         <View
//           style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
//         >
//           <View>
//             <ScrollView style={{ flex: 1 }}>
//               <Text>AccessToken: {accessToken}</Text>
//               <Text>idToken: {idToken}</Text>
//               <Text>refreshToken: {refreshToken}</Text>
//             </ScrollView>
//           </View>
//           <View>
//             <Button title="Refresh" onPress={refresh} />
//             <Button title="Logout" onPress={logout} />
//           </View>
//         </View>
//       ) : (
//         <Button title="Login" onPress={login} />
//       )}
//     </View>
//   );
// }
