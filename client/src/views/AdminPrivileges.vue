<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center">
      <h3>Users and roles which {{username}} administers</h3>

      <div v-for="courseName in Object.keys(coursesUsers)" v-bind:key="courseName">
        <h4><span>{{ courseName }}</span></h4>
        <div class="row" style="text-align: center;">
          <div class="assistant-container">
            <div class="ts-container" v-for="role in Object.keys(coursesUsers[courseName])"
                 v-bind:key="role">
              <h4><span>{{ role }}</span></h4>
              <div class="timeslot-container"
                   v-for="user in coursesUsers[courseName][role]" v-bind:key="user">
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
                  v-else-if="role==='assistants' && user.isAssistant===1"
                  v-on:click="revokePrivilege($event, user.name, courseName)"
                ><h4>{{user.name}}</h4></button>
                <button
                  type="button"
                  class="open"
                  ref="user.id"
                  v-else
                  v-on:click="grantPrivilege($event, user.name, courseName)"
                ><h4>{{user.name}}</h4></button>
              </div>
            </div>
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
    revokePrivilege(event, username, courseName) {
      console.log(username);
      console.log(courseName);
      event.preventDefault();
      this.socket.emit('revokePrivilege', { username, courseName });
    },
    grantPrivilege(event, username, courseName) {
      console.log(username);
      console.log(courseName);
      event.preventDefault();
      this.socket.emit('grantPrivilege', { username, courseName });
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

        this.coursesUsers = {};
        for (let i = 0; i < usersForCourses.length; i += 1) {
          const { admins } = usersForCourses[i];
          const { assistants } = usersForCourses[i];
          const { students } = usersForCourses[i];
          this.coursesUsers[usersForCourses[i].courseName] = {
            admins,
            assistants,
            students,
          };
        }
      } catch (err) {
        console.log(err);
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
    this.socket.on('updatePrivileges', () => {
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
