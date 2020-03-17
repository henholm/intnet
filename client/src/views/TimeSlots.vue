// src/views/TimeSlots.vue

<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center">
      <h1>Time Slots</h1>
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
              class="booked"
              ref="TS.id"
              v-if="TS.isBooked===1"
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
    timeSlots: [],
    aTS: {},
    userId: '',
    username: '',
    isAssistant: '',
  }),
  methods: {
    redirect(event, timeSlotId) {
      event.preventDefault();
      this.$router.push(`/bookTimeSlot/${timeSlotId}`).catch(() => {});
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

    if (!this.$store.getters.isLoggedIn) {
      this.$router.push('/login').catch(() => {});
    } else {
      const response = await RoutingService.getTimeSlots();
      this.timeSlots = response.timeSlots;
      // "aTS" stands for assistant Time Slots.
      const aTS = {};
      for (let i = 0; i < this.timeSlots.length; i += 1) {
        const currName = this.timeSlots[i].assistantName;
        if (!(Object.prototype.hasOwnProperty.call(aTS, currName))) {
          aTS[currName] = [];
        }
        aTS[currName].push(this.timeSlots[i]);
      }
      this.aTS = aTS;
    }
  },
  // Step 4 in lifecycle hooks.
  mounted() {
    this.socket.on('update', (data) => {
      this.timeSlots = data.timeSlots;
      // aTS = assistantTimeSlots
      const aTS = {};
      for (let i = 0; i < this.timeSlots.length; i += 1) {
        const currName = this.timeSlots[i].assistantName;
        if (!(Object.prototype.hasOwnProperty.call(aTS, currName))) {
          aTS[currName] = [];
        }
        aTS[currName].push(this.timeSlots[i]);
      }
      this.aTS = aTS;
    });
  },
};

</script>

<style>
  @import '../assets/timeSlots.css';
</style>
