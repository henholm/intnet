// src/services/RoutingService.js

import Axios from 'axios';

const url = 'https://localhost:8989/api/';

export default {
  login(credentials) {
    return Axios
      .post(`${url}login/`, credentials)
      .then(response => response.data);
  },
  // getSecretContent() {
  //   return axios.get(url + 'secret-route/').then(response => response.data);
  // }
  getTimeSlots() {
    return Axios.post(`${url}timeSlots/`, '').then(response => response.data);
  },

  getTimeSlotData(timeSlotId) {
    return Axios
      .post(`${url}timeSlotData/`, timeSlotId)
      .then(response => response.data);
  },
  // fetch(`/api/timeSlotData/${this.timeSlotId}`)
  //   .then(res => res.json())
  //   .then((data) => {
  //     this.countdown();
  //     this.timeSlotId = data.timeSlotData.id;
  //     this.timeSlotTime = data.timeSlotData.time;
  //     this.assistantId = data.timeSlotData.assistantId;
  //     this.assistantName = data.timeSlotData.assistantName;
  //   });
};
