<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center">
      <h2>{{assistantName}}'s time slots in {{courseName}}</h2>
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
      assistantId: '',
      assistantName: '',
      courseName: '',
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
      const payload = {
        assistantName: this.assistantName,
        assistantId: this.assistantId,
        time: slotTime,
        course: this.courseName,
      };
      this.socket.emit('addTimeSlot', payload);
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
    if (!this.$store.getters.isLoggedIn || this.$store.getters.getUser.isAssistant !== 1) {
      this.$router.push('/login').catch(err => console.log(err));
    }

    this.socket = this.$root.socket;
    this.socket.connect();

    const user = this.$store.getters.getUser;
    this.assistantId = user.userId;
    this.assistantName = user.username;

    this.courseName = this.$route.params.courseName;

    const response = await RoutingService.getTimeSlots();
    this.timeSlots = [];
    for (let i = 0; i < response.timeSlots.length; i += 1) {
      if (response.timeSlots[i].assistantName === this.assistantName) {
        if (response.timeSlots[i].courseName === this.courseName) {
          this.timeSlots.push(response.timeSlots[i]);
        }
      }
    }
  },
  // Step 4 in the lifecycle hooks.
  async mounted() {
    this.socket.on('update', (data) => {
      this.timeSlots = [];
      for (let i = 0; i < data.timeSlots.length; i += 1) {
        if (data.timeSlots[i].assistantName === this.assistantName) {
          if (data.timeSlots[i].courseName === this.courseName) {
            this.timeSlots.push(data.timeSlots[i]);
          }
        }
      }
    });
    this.socket.on('updateCourses', (data) => {
      let exists = false;
      for (let i = 0; i < data.courses.length; i += 1) {
        if (data.courses.name === this.courseName) {
          exists = true;
        }
      }
      if (!exists) {
        // The course was removed.
        this.$router.push('/courses').catch(() => {});
      }
    });
  },
  // Step 5 in lifecycle hooks.
  onUpdate() {
    if (!this.$store.getters.isLoggedIn || this.$store.getters.getUser.isAssistant !== 1) {
      this.$router.push('/login').catch(() => {});
    }
  },
};

</script>

<style>
  @import '../assets/timeSlots.css';
</style>
