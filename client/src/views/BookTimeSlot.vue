
<template>
  <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
    <h1>Time slot booking</h1>
    <div>
      <h4>Time: {{this.timeSlotTime}}</h4>
      <h4>Assistant: {{this.assistantName}}</h4>
      <div class="countdownTimer">
        <h4>{{this.countdownSeconds}} seconds left</h4>
      </div>
      <h4>Enter your name and click 'Reserve' to reserve this slot</h4>
      <form>
        <input class="form-control" type="text" v-model="bookedByName" required autofocus />
        <input class="btn btn-default" type="submit" value="Reserve" v-on:click="reserve()"/>
        <input class="btn btn-default" type="submit" value="Cancel" v-on:click="abort()"/>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookTimeSlot',
  components: {},
  data() {
    return {
      countdownTime: '',
      countdownSeconds: 20,
      timeSlotId: this.$route.params.timeSlotId,
      timeSlotTime: '',
      assistantId: '',
      assistantName: '',
      bookedByName: '',
      socket: null,
    };
  },
  methods: {
    reserve() {
      this.socket.emit('changeState', { id: this.timeSlotId, bookedBy: this.bookedByName });
      clearInterval(this.countdownTime);
      this.$router.push('/timeSlots');
    },
    abort() {
      this.socket.emit('changeState', { id: this.timeSlotId, bookedBy: 'no one' });
      clearInterval(this.countdownTime);
      this.$router.push('/timeSlots');
    },
    countdown() {
      this.countdownTime = setInterval(() => {
        this.countdownSeconds -= 1;
        if (this.countdownSeconds === 0) {
          this.socket.emit('changeState', { id: this.timeSlotId, bookedBy: 'no one' });
          this.countdownSeconds = 20;
          clearInterval(this.countdownTime);
          this.$router.push('/timeSlots');
        }
      }, 1000);
    },
  },
  // Step 2 in lifecycle hooks.
  async created() {
    this.socket = this.$root.socket;
    this.socket.emit('changeState', { id: this.timeSlotId, bookedBy: 'reserved' });

    if (!this.$store.getters.isLoggedIn) {
      this.$router.push('/login');
    } else {
      const response = await RoutingService.getTimeSlots();
    }

    fetch(`/api/timeSlotData/${this.timeSlotId}`)
      .then(res => res.json())
      .then((data) => {
        this.countdown();
        this.timeSlotId = data.timeSlotData.id;
        this.timeSlotTime = data.timeSlotData.time;
        this.assistantId = data.timeSlotData.assistantId;
        this.assistantName = data.timeSlotData.assistantName;
      });
  },
};
</script>
