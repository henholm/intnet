<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center">
      <h1>{{assistantName}}'s Time Slots</h1>
      <div class="btn-group">
        <div v-for="TS in timeSlots" v-bind:key="TS.id">
          <!-- eslint-disable-next-line max-len -->
          <!-- <button type="button" v-if="TS.bookedBy==='no one'" class="open" v-on:click="redirect($event, TS.id)" ref="TS.id"> -->
          <!-- eslint-disable-next-line max-len -->
          <button type="button" v-if="TS.bookedBy==='no one'" v-on:click="remove($event, TS.id)" class="a-open" ref="TS.id">
            {{TS.time}}: open
          </button>
          <!-- eslint-disable-next-line max-len -->
          <button type="button" v-else-if="TS.bookedBy==='reserved'" v-on:click="remove($event, TS.id)" class="a-reserved" ref="TS.id">
            {{TS.time}}: reserved
          </button>
          <!-- eslint-disable-next-line max-len -->
          <button type="button" v-else v-on:click="remove($event, TS.id)" class="a-booked" ref="TS.id">
            {{TS.time}}: booked by {{TS.bookedBy}}
          </button>
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
export default {
  name: 'AssistantAdmin',
  components: {},
  data() {
    return {
      assistantName: this.$route.params.assistantName,
      timeSlots: [],
      slotTime: '',
      // socket: null,
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
  // Step 1 in lifecycle hooks.
  beforeCreate() {
    // The following line is executed before the one in data().
    this.assistantName = this.$route.params.assistantName;
    fetch(`/api/assistantLogin/${this.assistantName}`)
      .then(res => res.json())
      .then((data) => {
        this.timeSlots = data.timeSlots;
      });
  },
  // Step 2 in lifecycle hooks.
  created() {
    this.socket = this.$root.socket;
    this.socket.connect();
  },
  // Step 4 in lifecycle hooks.
  mounted() {
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
  @import '../assets/styleTimeSlots.css';
</style>
