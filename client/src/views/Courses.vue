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
  },
  async created() {
    // If not authenticated , redirect to login page.
    if (!this.$store.getters.isLoggedIn) {
      this.$router.push('/login').catch(() => {});
    }

    this.socket = this.$root.socket;
    this.socket.connect();

    const user = this.$store.getters.getUser;
    this.username = user.username;
    this.isAssistant = user.isAssistant;
    this.isAdmin = user.isAdmin;

    try {
      const response = await RoutingService.getCourses(user);
      const courseLists = response.response;
      this.attendsCourses = courseLists.attendsCourses;
      this.assistsCourses = courseLists.assistsCourses;
      this.administersCourses = courseLists.administersCourses;
    } catch (err) {
      console.log(err);
    }
  },
  // Step 4 in the lifecycle hooks.
  async mounted() {
    this.socket.on('updateCourses', async () => {
      try {
        const response = await RoutingService.getCourses(this.$store.getters.getUser);
        const courseLists = response.response;
        this.attendsCourses = courseLists.attendsCourses;
        this.assistsCourses = courseLists.assistsCourses;
        this.administersCourses = courseLists.administersCourses;
      } catch (err) {
        console.log(err);
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
