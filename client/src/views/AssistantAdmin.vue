<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center">
      <h1>{{assistantName}}'s Time Slots</h1>
      <div class="btn-group">
        <div v-for="TS in timeSlots" v-bind:key="TS.id">
          <button
            type="button"
            v-if="TS.isBooked===1"
            v-on:click="remove($event, TS.id)"
            class="a-booked"
            ref="TS.id"
          >{{TS.time}}: booked by {{TS.bookedBy}}</button>
          <button
            type="button"
            v-else-if="TS.isReserved===1"
            v-on:click="remove($event, TS.id)"
            class="a-reserved"
            ref="TS.id"
          >{{TS.time}}: reserved by {{TS.reservedBy}}</button>
          <button
            type="button"
            v-else
            v-on:click="remove($event, TS.id)"
            class="a-open"
            ref="TS.id"
          >{{TS.time}}: open time slot</button>
        </div>
      </div>
      <div>
        <br>
        <h5>To add a new time slot, please input the desired time.</h5>
        <form @submit="checkForm">
          <p>
            <label for="slotTime">E.g. "12:00 - 13:00"</label>
            <input type="text" id="slotTime" v-model="slotTime" required />
          </p>
          <input class="btn btn-default" type="submit" value="OK"/>
        </form>
      </div>
    </section>
  </div>
</template>

<script>
import RoutingService from '@/services/RoutingService';

export default {
  name: 'AssistantAdmin',
  components: {},
  data() {
    return {
      // assistantName: this.$route.params.assistantName,
      assistantId: '',
      assistantName: '',
      timeSlots: [],
      slotTime: '',
      socket: null,
    };
  },
  methods: {
    remove(event, timeSlotId) {
      event.preventDefault();
      this.socket.emit('removeTimeSlot', { id: timeSlotId });
    },
    addSlot(slotTime) {
      this.socket.emit('addTimeSlot', { name: this.assistantName, time: slotTime });
    },
    checkForm(event) {
      if (this.slotTime) {
        this.addSlot(this.slotTime);
      }
      event.preventDefault();
    },
  },
  // Step 2 in lifecycle hooks.
  async created() {
    // If not authenticated or if not assistant, redirect to login page.
    const { isLoggedIn } = this.$store.getters;
    const { isAssistant } = this.$store.getters.getUser;

    if (!isLoggedIn || isAssistant !== 1) {
      this.$router.push('/login').catch(err => console.log(err));
    }

    this.socket = this.$root.socket;
    this.socket.connect();

    const user = this.$store.getters.getUser;
    this.assistantId = user.userId;
    this.assistantName = user.username;

    const response = await RoutingService.getTimeSlots();
    this.timeSlots = [];
    for (let i = 0; i < response.timeSlots.length; i += 1) {
      if (response.timeSlots[i].assistantName === this.assistantName) {
        this.timeSlots.push(response.timeSlots[i]);
      }
    }
  },
  // Step 4 in the lifecycle hooks.
  async mounted() {
    this.socket.on('update', (data) => {
      this.timeSlots = [];
      for (let i = 0; i < data.timeSlots.length; i += 1) {
        if (data.timeSlots[i].assistantName === this.assistantName) {
          this.timeSlots.push(data.timeSlots[i]);
        }
      }
    });
  },
};

</script>

<style>
  @import '../assets/timeSlots.css';
</style>
