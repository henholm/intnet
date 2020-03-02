<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center">
      <h1>Time Slots</h1>
      <div class="assistant-container">
        <div class="ts-container" v-for="name in Object.keys(aTS)" v-bind:key="name">
          <h3>{{name}}</h3>
          <div v-for="TS in aTS[name]" v-bind:key="TS.id" class="timeslot-container">
            <!-- eslint-disable-next-line max-len -->
            <button type="button" v-if="TS.bookedBy==='no one'" class="open" v-on:click="redirect($event, TS.id)" ref="TS.id">
              <h4>{{TS.time}}</h4>
            </button>
            <button type="button" v-else-if="TS.bookedBy==='reserved'" class="reserved" ref="TS.id">
              <h4>{{TS.time}}</h4>
            </button>
            <button type="button" v-else class="booked" ref="TS.id">
              <h4>{{TS.time}}</h4>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Queues',
  components: {},
  data: () => ({
    queues: [],
  }),
  methods: {
    redirect(event, queueId) {
      event.preventDefault();
      this.$router.push(`/queues/${queueId}`);
    },
  },
  // Step 1 in lifecycle hooks.
  beforeCreate() {
    this.socket = this.$root.socket;
    this.socket.connect();
    fetch('/api/queues')
      .then(res => res.json())
      .then((data) => {
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
  @import '../assets/styleTimeSlots.css';
</style>
