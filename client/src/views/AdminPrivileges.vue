<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center">
      <h3>Users and roles which {{username}} administers</h3>
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
              v-on:click="revokePrivilege($event, user.id)"
            ><h4>{{user.name}}</h4></button>
            <button
              type="button"
              class="open"
              ref="user.id"
              v-else
              v-on:click="grantPrivilege($event, user.id)"
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
      user: '', // remove
      username: '',
      courses: [],
      coursesUsers: {},
      socket: null,
    };
  },
  methods: {
    revokePrivilege(event, userId) {
      console.log(userId);
      event.preventDefault();
      // this.socket.emit('removeTimeSlot', { id: timeSlotId });
    },
    grantPrivilege(event, userId) {
      console.log(userId);
      event.preventDefault();
      // this.socket.emit('removeTimeSlot', { id: timeSlotId });
    },
    async updateCoursesUsers() {
      try {
        const res = await RoutingService.getCourses(this.user);
        this.courses = res.response.administersCourses;
        this.coursesUsers = {};

        const promises = [];
        for (let i = 0; i < this.courses.length; i += 1) {
          const courseName = this.courses[i].name;
          promises.push(RoutingService.getUsersForCourse({ courseName }));
        }

        const usersForCourses = await Promise.all(promises);

        console.log(usersForCourses);

        const coursesUsers = {};
        for (let i = 0; i < usersForCourses.length; i += 1) {
          const users = [];
          console.log(usersForCourses[i]);
          users.push(...usersForCourses[i].admins);
          users.push(...usersForCourses[i].assistants);
          users.push(...usersForCourses[i].students);
          coursesUsers[usersForCourses[i].courseName] = users;
        }

        console.log(coursesUsers);

        // for (let j = 0; j < response.users.length; j += 1) {
        //   if (response.users[j].courseName === this.courseName) {
        //     let currentRole;
        //     if (response.users[j].isAssistant === 1) {
        //       currentRole = 'assistant';
        //     } else if (response.users[j].isAdmin === 1) {
        //       currentRole = 'admin';
        //     } else {
        //       currentRole = 'student';
        //     }
        //     if (!(Object.prototype.hasOwnProperty.call(users, currentRole))) {
        //       users[currentRole] = [];
        //     }
        //     users[currentRole].push(response.users[j]);
        //   }
        // }
        // this.coursesUsers[courseName] = users;
      } catch (err) {
        console.log(err);
      }

      // for (let i = 0; i < usersForCourses.length; i += 1) {
      //
      // }
      //
      //
      // for (let i = 0; i < this.courses.length; i += 1) {
      //   const courseName = this.course[i].name;
      //   console.log(courseName);
      //   const response = await RoutingService.getUsersForCourse(this.courseName);
      //   console.log(response);
      //   console.log(response.response);
      //   const users = {};
      //   for (let j = 0; j < response.users.length; j += 1) {
      //     if (response.users[j].courseName === this.courseName) {
      //       let currentRole;
      //       if (response.users[j].isAssistant === 1) {
      //         currentRole = 'assistant';
      //       } else if (response.users[j].isAdmin === 1) {
      //         currentRole = 'admin';
      //       } else {
      //         currentRole = 'student';
      //       }
      //       if (!(Object.prototype.hasOwnProperty.call(users, currentRole))) {
      //         users[currentRole] = [];
      //       }
      //       users[currentRole].push(response.users[j]);
      //     }
      //   }
      //   this.coursesUsers[courseName] = users;
      // }
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

    this.user = this.$store.getters.getUser;
    this.userId = this.$store.getters.getUser.userId;
    this.username = this.$store.getters.getUser.username;

    this.updateCoursesUsers();
  },
  // Step 4 in the lifecycle hooks.
  async mounted() {
    this.socket.on('updateCourses', () => {
      this.updateCoursesUsers();
    });
    this.socket.on('updateUsers', () => {
      this.updateCoursesUsers();
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
