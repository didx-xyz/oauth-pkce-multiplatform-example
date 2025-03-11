import axios from "axios";

const API_KEY = "AIzaSyDdPeJqFvk8UDS_QiNQ3bTM0SwS3s1QJtU";

// THis does not use oAuth, but rather the Firebase REST API

async function authenticate(mode, email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${API_KEY}`;
  const res = await axios.post(url, {
    email,
    password,
    returnSecureToken: true,
  });

  const token = res.data.idToken;

  return token;
}

export function createUser(email, password) {
  return authenticate("signUp", email, password);
}

export function login(email, password) {
  return authenticate("signInWithPassword", email, password);
}
