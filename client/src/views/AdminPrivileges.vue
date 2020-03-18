<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center">
      <h2>Users and roles which {{username}}</h2>
      <div class="assistant-container">
        <div
          class="ts-container"
          v-for="role in Object.keys(users)"
          v-bind:key="role"
        ><h3>{{role}}</h3>
          <div
            class="timeslot-container"
            v-for="user in users[role]"
            v-bind:key="user.id"
          >
            <button
              type="button"
              class="booked"
              ref="user.id"
              v-if="user.isAdmin===1"
            ><h4>{{user.name}}</h4></button>
            <button
              type="button"
              class="reservedByMe"
              ref="user.id"
              v-else-if="user.isAssistant===1"
              v-on:click="enterAssistant($event, user.id)"
            ><h4>{{user.name}}</h4></button>
            <button
              type="button"
              class="open"
              ref="user.id"
              v-else
              v-on:click="enterStudent($event, user.id)"
            ><h4>{{user.name}}</h4></button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import RoutingService from '@/services/RoutingService';

export default {
  name: 'AdminPrivileges',
  components: {},
  data() {
    return {
      userId: '',
      username: '',
      courses: [],
      coursesUsers: {},
      socket: null,
    };
  },
  methods: {
    remove(event, timeSlotId) {
      event.preventDefault();
      this.socket.emit('removeTimeSlot', { id: timeSlotId });
    },
    updateCoursesUsers() {
      const res = await RoutingService.getCourses(this.user);
      this.courses = res.response.administersCourses;
      this.coursesUsers = {};

      for (let i = 0; i < this.courses.length; i += 1) {
        const courseName = this.course[i].name;
        console.log(courseName);
        const response = await RoutingService.getUsersForCourse(this.courseName);
        console.log(response);
        console.log(response.response);
        const users = {};
        for (let i = 0; i < response.users.length; i += 1) {
          if (response.users[i].courseName === this.courseName) {
            let currentRole;
            if (response.users[i].isAssistant === 1) {
              currentRole = 'assistant';
            } else if (response.users[i].isAdmin === 1) {
              currentRole = 'admin';
            } else {
              currentRole = 'student';
            }
            if (!(Object.prototype.hasOwnProperty.call(users, currentRole))) {
              users[currentRole] = [];
            }
            users[currentRole].push(response.users[i]);
          }
        }
        this.coursesUsers[courseName] = users;
      }
    },
  },
  // Step 2 in lifecycle hooks.
  async created() {
    // If not authenticated or if not assistant, redirect to login page.
    if (!this.$store.getters.isLoggedIn || this.$store.getters.getUser.isAdmin !== 1) {
      this.$router.push('/login').catch(err => console.log(err));
    }

    this.socket = this.$root.socket;
    this.socket.connect();

    this.userId = this.$store.getters.getUser.userId;
    this.username = this.$store.getters.getUser.username;

    updateCoursesUsers();
  },
  // Step 4 in the lifecycle hooks.
  async mounted() {
    this.socket.on('updateCourses', (data) => {
      updateCoursesUsers();
    });
    this.socket.on('updateUsers', () => {
      updateCoursesUsers();
    });
  },
  // Step 5 in lifecycle hooks.
  onUpdate() {
    if (!this.$store.getters.isLoggedIn || this.$store.getters.getUser.isAdmin !== 1) {
      this.$router.push('/login').catch(() => {});
    }
  },
};

</script>

<style>
  @import '../assets/timeSlots.css';
</style>
