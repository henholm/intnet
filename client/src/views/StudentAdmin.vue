<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center">
      <h1>{{studentName}}'s Time Slots</h1>
      <div class="btn-group">
        <div v-for="TS in timeSlots" v-bind:key="TS.id">
          <button
            type="button"
            v-on:click="remove($event, TS.id)"
            class="a-booked"
            ref="TS.id"
          >{{TS.time}}</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import RoutingService from '@/services/RoutingService';

export default {
  name: 'StudentAdmin',
  components: {},
  data() {
    return {
      // studentName: this.$route.params.assistantName,
      studentId: '',
      studentName: '',
      timeSlots: [],
      socket: null,
    };
  },
  methods: {
    remove(event, timeSlotId) {
      event.preventDefault();
      this.socket.emit('removeTimeSlot', { id: timeSlotId });
    },
  },
  // Step 2 in lifecycle hooks.
  async created() {
    // If not authenticated , redirect to login page.
    const { isLoggedIn } = this.$store.getters;

    if (!isLoggedIn) {
      this.$router.push('/login');
    }

    this.socket = this.$root.socket;
    this.socket.connect();

    const user = this.$store.getters.getUser;
    this.studentId = user.userId;
    this.studentName = user.username;

    const payload = { studentName: this.studentName };

    const response = await RoutingService.getStudentTimeSlots(payload);
    this.timeSlots = response.timeSlots;
  },
  // Step 4 in the lifecycle hooks.
  async mounted() {
    this.socket.on('update', (data) => {
      this.timeSlots = [];
      for (let i = 0; i < data.timeSlots.length; i += 1) {
        if (data.timeSlots[i].bookedBy === this.studentName) {
          this.timeSlots.push(data.timeSlots[i]);
        }
      }
    });
  },
};

</script>

<style>
  @import '../assets/styleTimeSlots.css';
</style>
