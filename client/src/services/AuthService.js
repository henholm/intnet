// src/services/AuthService.js

import axios from 'axios';

const url = 'https://localhost:8989/api/';

export default {
  login(credentials) {
    console.log('credentials');
    console.log(credentials);
    return axios
      .post(`${url}login/`, credentials)
      .then(response => response.data);
  },
  // getSecretContent() {
  //   return axios.get(url + 'secret-route/').then(response => response.data);
  // }
};
