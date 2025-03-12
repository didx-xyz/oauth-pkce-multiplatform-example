import axios from "axios";

const API_KEY = "AIzaSyDdPeJqFvk8UDS_QiNQ3bTM0SwS3s1QJtU";

// THis does not use oAuth, but rather the Firebase REST API

async function authenticate(mode, email, password) {
  // const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${API_KEY}`;
  const url = `http://keycloak.127.0.0.1.nip.io/auth/realms/mobile/protocol/openid-connect/token`;
  // const res = await axios.post(url, {
  //   email,
  //   password,
  //   returnSecureToken: true,
  // });
  // curl -X POST "http://keycloak.127.0.0.1.nip.io/auth/realms/samplecreds/protocol/openid-connect/token" \
  //   -H "Content-Type: application/x-www-form-urlencoded" \
  //   -d "grant_type=password" \
  //   -d "client_id=yoid-wallet" \
  //   -d "client_secret=AWeOTiQF3wZpkAL9qYY4I6LFTsV7iC9z" \
  //   -d "username=john" \
  //   -d "password=123"
  const res = await axios.post(
    url,
    // Use URLSearchParams to format data as form parameters
    new URLSearchParams({
      grant_type: "password",
      client_id: "vfLsrbS8wJ9V7vJt8fzsAo0APuf1kPdn",
      username: email,
      password: password,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  console.log("res", res);

  // const token = res.data.idToken;
  const token = res.data.access_token;

  return token;
}

export function createUser(email, password) {
  return authenticate("signUp", email, password);
}

export function login(email, password) {
  return authenticate("signInWithPassword", email, password);
}
