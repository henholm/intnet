// src/views/TimeSlots.vue

<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center">
      <h2>Time slots for {{this.courseName}}</h2>
      <div class="assistant-container">
        <div
          class="ts-container"
          v-for="name in Object.keys(aTS)"
          v-bind:key="name"
        ><h3>{{name}}</h3>
          <div
            class="timeslot-container"
            v-for="TS in aTS[name]"
            v-bind:key="TS.id"
          >
            <button
              type="button"
              class="bookedByMe"
              ref="TS.id"
              v-if="TS.isBooked===1 && TS.bookedBy===username"
              v-on:click="remove($event, TS.id)"
            ><h4>{{TS.time}}</h4></button>
            <button
              type="button"
              class="booked"
              ref="TS.id"
              v-else-if="TS.isBooked===1"
            ><h4>{{TS.time}}</h4></button>
            <button
              type="button"
              class="reservedByMe"
              ref="TS.id"
              v-else-if="TS.isReserved===1 && TS.reservedBy===username"
              v-on:click="remove($event, TS.id)"
            ><h4>{{TS.time}}</h4></button>
            <button
              type="button"
              class="reserved"
              ref="TS.id"
              v-else-if="TS.isReserved===1"
            ><h4>{{TS.time}}</h4></button>
            <button
              type="button"
              class="open"
              ref="TS.id"
              v-else
              v-on:click="redirect($event, TS.id)"
            ><h4>{{TS.time}}</h4></button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import RoutingService from '@/services/RoutingService';

export default {
  name: 'TimeSlots',
  components: {},
  data: () => ({
    courseName: '',
    aTS: {},
    userId: '',
    username: '',
    isAssistant: '',
  }),
  methods: {
    redirect(event, timeSlotId) {
      event.preventDefault();
      /* eslint-disable-next-line max-len */
      this.$router.push(`/courses/${this.courseName}/timeslots/booktimeslot/${timeSlotId}`).catch(() => {});
    },
    remove(event, timeSlotId) {
      event.preventDefault();
      const payload = {
        timeSlotId,
        isReserved: 0,
        reservedBy: null,
        isBooked: 0,
        bookedBy: null,
      };
      this.socket.emit('changeState', payload);
    },
  },
  // Step 2 in lifecycle hooks.
  async created() {
    const user = this.$store.getters.getUser;
    this.userId = user.userId;
    this.username = user.username;
    this.isAssistant = user.isAssistant;

    this.socket = this.$root.socket;
    this.socket.connect();

    this.courseName = this.$route.params.courseName;

    if (!this.$store.getters.isLoggedIn) {
      this.$router.push('/login').catch(() => {});
    } else {
      const response = await RoutingService.getTimeSlots();
      this.timeSlots = response.timeSlots;

      this.aTS = {}; // "aTS" stands for assistant Time Slots.
      for (let i = 0; i < response.timeSlots.length; i += 1) {
        if (response.timeSlots[i].courseName === this.courseName) {
          const currName = response.timeSlots[i].assistantName;
          if (!(Object.prototype.hasOwnProperty.call(this.aTS, currName))) {
            this.aTS[currName] = [];
          }
          this.aTS[currName].push(response.timeSlots[i]);
        }
      }
    }
  },
  // Step 4 in lifecycle hooks.
  mounted() {
    this.socket.on('update', (data) => {
      this.aTS = {}; // aTS = assistantTimeSlots
      for (let i = 0; i < data.timeSlots.length; i += 1) {
        if (data.timeSlots[i].courseName === this.courseName) {
          const currName = data.timeSlots[i].assistantName;
          if (!(Object.prototype.hasOwnProperty.call(this.aTS, currName))) {
            this.aTS[currName] = [];
          }
          this.aTS[currName].push(data.timeSlots[i]);
        }
      }
    });
  },
  // Step 5 in lifecycle hooks.
  onUpdate() {
    if (!this.$store.getters.isLoggedIn) {
      this.$router.push('/login').catch(() => {});
    }
  },
};

</script>

<style>
  @import '../assets/timeSlots.css';
</style>
