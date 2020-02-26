
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
          console.log('User idle. Time slot reservation aborted.');
          this.socket.emit('changeState', { id: this.timeSlotId, bookedBy: 'no one' });
          this.countdownSeconds = 20;
          clearInterval(this.countdownTime);
          this.$router.push('/timeSlots');
        }
      }, 1000);
    },
  },
  // Step 1 in lifecycle hooks.
  beforeCreate() {},
  // Step 2 in lifecycle hooks.
  created() {
    console.log('BookTimeSlot.vue is being created');
    this.socket = this.$root.socket;
    this.socket.emit('changeState', { id: this.timeSlotId, bookedBy: 'reserved' });
    fetch(`/api/timeSlotData/${this.timeSlotId}`)
      .then(res => res.json())
      .then((data) => {
        console.log('BookTimeSlot created');
        this.countdown();
        this.timeSlotId = data.timeSlotData.id;
        this.timeSlotTime = data.timeSlotData.time;
        this.assistantId = data.timeSlotData.assistantId;
        this.assistantName = data.timeSlotData.assistantName;
      })
      .catch(console.error);
  },
  // Step 3 in lifecycle hooks.
  beforeMount() {},
  // Step 4 in lifecycle hooks.
  mounted() {},
  // Step 5 in lifecycle hooks.
  beforeUpdate() {},
  // Step 6 in lifecycle hooks.
  updated() {},
  // Step 7 in lifecycle hooks.
  beforeDestroy() {
    // this.socket.emit('changeState', { id: this.timeSlotId, bookedBy: 'no one' });
  },
  // Step 8 in lifecycle hooks.
  destroyed() {},
};
</script>
