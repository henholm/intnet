// src/services/RoutingService.js

import Axios from 'axios';

const url = 'https://localhost:8989/api/';

export default {
  login(credentials) {
    return Axios.post(`${url}login/`, credentials).then(response => response.data);
  },
  logout(user) {
    return Axios.post(`${url}logout/`, user).then(response => response.data);
  },
  setLoggedIn(user) {
    return Axios.post(`${url}setLoggedIn/`, user).then(response => response.data);
  },
  getTimeSlots() {
    return Axios.post(`${url}timeSlots/`, '').then(response => response.data);
  },
  getTimeSlotData(payload) {
    return Axios.post(`${url}timeSlotData/`, payload).then(response => response.data);
  },
  getAssistantTimeSlots(payload) {
    return Axios.post(`${url}assistantAdmin/`, payload).then(response => response.data);
  },
  getStudentTimeSlots(payload) {
    return Axios.post(`${url}studentAdmin/`, payload).then(response => response.data);
  },
  checkValidSession(user) {
    return Axios.post(`${url}checkValidSession/`, user).then(response => response.data);
  },
};
