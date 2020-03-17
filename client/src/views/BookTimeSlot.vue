
<template>
  <div v-if="this.show" class="text-box col-md-4 col-md-offset-4" style="text-align: center">
    <h1>Time slot booking</h1>
    <div>
      <h4>Course: {{this.courseName}}</h4>
      <h4>Time: {{this.timeSlotTime}}</h4>
      <h4>Assistant: {{this.assistantName}}</h4>
      <div class="countdownTimer">
        <h4>{{this.countdownSeconds}} seconds left</h4>
      </div>
      <h4>Do you want to book this time slot?</h4>
      <input class="btn btn-default" type="submit" value="Reserve" v-on:click="book()"/>
      <input class="btn btn-default" type="submit" value="Cancel" v-on:click="abort()"/>
    </div>
  </div>
</template>

<script>
import RoutingService from '@/services/RoutingService';

export default {
  name: 'BookTimeSlot',
  components: {},
  data() {
    return {
      show: false,
      countdownTime: '',
      countdownSeconds: 20,
      timeSlotId: this.$route.params.timeSlotId,
      timeSlotTime: '',
      assistantId: '',
      assistantName: '',
      courseName: '',
      socket: null,
    };
  },
  methods: {
    book() {
      const payload = {
        timeSlotId: this.timeSlotId,
        isReserved: 0,
        reservedBy: null,
        isBooked: 1,
        bookedBy: this.$store.getters.getUser.username,
      };
      this.socket.emit('changeState', payload);
      clearInterval(this.countdownTime);
      this.$router.push(`/courses/${this.courseName}/timeslots`).catch(() => {});
    },
    abort() {
      const payload = {
        timeSlotId: this.timeSlotId,
        isReserved: 0,
        reservedBy: null,
        isBooked: 0,
        bookedBy: null,
      };
      this.socket.emit('changeState', payload);
      clearInterval(this.countdownTime);
      // this.$router.push('/timeSlots').catch(() => {});
      this.$router.push(`/courses/${this.courseName}/timeslots`).catch(() => {});
    },
    countdown() {
      this.countdownTime = setInterval(() => {
        this.countdownSeconds -= 1;
        if (this.countdownSeconds === 0) {
          this.countdownSeconds = 20;
          clearInterval(this.countdownTime);
          this.$router.push(`/courses/${this.courseName}/timeslots`).catch(() => {});
        }
      }, 1000);
    },
  },
  // Step 2 in lifecycle hooks.
  created() {
    this.socket = this.$root.socket;
    if (!this.$store.getters.isLoggedIn) {
      this.$router.push('/login').catch(() => {});
    } else {
      const payload = {
        timeSlotId: this.timeSlotId,
        isReserved: 1,
        reservedBy: this.$store.getters.getUser.username,
        isBooked: 0,
        bookedBy: null,
      };
      RoutingService.getTimeSlotData(payload).then((response) => {
        this.socket.emit('changeState', payload);
        this.countdown();
        const { timeSlotData } = response;
        this.timeSlotId = timeSlotData.id;
        this.timeSlotTime = timeSlotData.time;
        this.assistantId = timeSlotData.assistantId;
        this.assistantName = timeSlotData.assistantName;
        this.courseName = timeSlotData.courseName;
        this.show = true;
      }).catch((err) => {
        console.log(err);
        this.$router.go(-1);
      });
    }
  },
};
</script>
