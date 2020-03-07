// src/services/RoutingService.js

import Axios from 'axios';

const url = 'https://localhost:8989/api/';

export default {
  login(credentials) {
    return Axios
      .post(`${url}login/`, credentials)
      .then(response => response.data);
  },
  // logout(userId) {
  //   return Axios
  //     .post(`${url}login/`, credentials)
  //     .then(response => response.data);
  // },
  getTimeSlots() {
    return Axios.post(`${url}timeSlots/`, '').then(response => response.data);
  },
  getTimeSlotData(payload) {
    return Axios
      .post(`${url}timeSlotData/`, payload)
      .then(response => response.data);
  },
};
