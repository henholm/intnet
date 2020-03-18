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
  getCourses(user) {
    return Axios.post(`${url}courses/`, user).then(response => response.data);
  },
  getUsersForCourse(courseName) {
    return Axios.post(`${url}users/`, courseName).then(response => response.data);
  },
  getTimeSlots() {
    return Axios.post(`${url}timeSlots/`, '').then(response => response.data);
  },
  getTimeSlotData(payload) {
    return Axios.post(`${url}timeSlotData/`, payload).then(response => response.data);
  },
  checkValidSession(user) {
    return Axios.post(`${url}checkValidSession/`, user).then(response => response.data);
  },
  checkIfStudentTakesCourse(userId, courseName) {
    /* eslint-disable-next-line max-len */
    return Axios.post(`${url}checkIfStudentTakesCourse/`, userId, courseName).then(response => response.data);
  },
};
