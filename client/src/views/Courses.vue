<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">

      <div v-if="this.isAdmin===1" class="row">
        <div class="row" style="text-align: center;">
          <h2>Courses you administer</h2>
        </div>
        <div
          class="well"
          v-for="course in administersCourses"
          @click="redirectAdministers(course.name)"
          :key="course.name"
        >
          <div class="row" style="text-align: center;">
            <h4>
              <span>{{ course.name }}</span>
            </h4>
          </div>
        </div>
      </div>

      <div v-if="this.isAssistant===1" class="row">
        <div class="row" style="text-align: center;">
          <h2>Courses you assist</h2>
        </div>
        <div
          class="well"
          v-for="course in assistsCourses"
          @click="redirectAssists(course.name)"
          :key="course.name"
        >
          <div class="row" style="text-align: center;">
            <h4>
              <span>{{ course.name }}</span>
            </h4>
          </div>
        </div>
      </div>

      <div v-if="this.isAdmin!==1" class="row">
        <div class="row" style="text-align: center;">
          <h2>Courses you attend</h2>
        </div>
        <div
          class="well"
          v-for="course in attendsCourses"
          @click="redirectAttends(course.name)"
          :key="course.name"
        >
          <div class="row" style="text-align: center;">
            <h4>
              <span>{{ course.name }}</span>
            </h4>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script>
import RoutingService from '@/services/RoutingService';

export default {
  name: 'Courses',
  components: {},
  data: () => ({
    attendsCourses: [],
    assistsCourses: [],
    administersCourses: [],
    isAssistant: 0,
    isAdmin: 0,
    socket: null,
  }),
  methods: {
    redirectAttends(courseName) {
      this.$router.push(`/courses/${courseName}/timeslots`);
    },
    redirectAssists(courseName) {
      this.$router.push(`/courses/${courseName}/${this.username}`);
    },
    redirectAdministers(courseName) {
      this.$router.push(`/courses/${courseName}/timeslots`);
    },
    async updateCourses() {
      try {
        const response = await RoutingService.getCourses(this.user);
        const courseLists = response.response;
        this.attendsCourses = courseLists.attendsCourses;
        this.assistsCourses = courseLists.assistsCourses;
        this.administersCourses = courseLists.administersCourses;
      } catch (err) {
        console.log(err);
      }
    },
    logout() {
      if (this.$store.getters.isLoggedIn) {
        const user = this.$store.getters.getUser;
        RoutingService.logout(user).then(() => {
          this.$store.dispatch('logout');
        }).catch((err) => {
          this.msg = err.response.data.msg;
        });
      }
    },
  },
  async created() {
    // If not authenticated , redirect to login page.
    if (!this.$store.getters.isLoggedIn) {
      this.$router.push('/login').catch(() => {});
    }

    this.socket = this.$root.socket;
    this.socket.connect();

    this.user = this.$store.getters.getUser;
    this.username = this.user.username;
    this.isAssistant = this.user.isAssistant;
    this.isAdmin = this.user.isAdmin;

    this.updateCourses();
  },
  // Step 4 in the lifecycle hooks.
  async mounted() {
    this.socket.on('updateCourses', async () => {
      if (!this.$store.getters.isLoggedIn) {
        this.$router.push('/login').catch(() => {});
      }
      this.updateCourses();
    });
    this.socket.on('updatePrivileges', async (username) => {
      if (this.$store.getters.getUser.username === username) {
        this.logout();
        // Prompt re-login if your privileges changed.
        this.$router.push('/login').catch(() => {});
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
