<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>Courses</h1>
      </div>

      <div class="row">
        <div
          class="well"
          v-for="course in courses"
          @click="redirect(course.name)"
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
    isAssistant: false,
    isAdmin: false,
    socket: null,
  }),
  methods: {
    redirect(courseName) {
      this.$router.push(`/courses/${courseName}`);
    },
  },
  async created() {
    // If not authenticated , redirect to login page.
    const { isLoggedIn } = this.$store.getters;

    if (!isLoggedIn) {
      this.$router.push('/login').catch(() => {});
    }

    this.socket = this.$root.socket;
    this.socket.connect();

    const user = this.$store.getters.getUser;
    // this.assistantId = user.userId;
    this.username = user.username;
    this.isAssistant = user.isAssistant;
    this.isAdmin = user.isAdmin;

    const response = await RoutingService.getCourses(user);
    console.log(response);
    this.attendsCourses = response.attendsCourses;
    this.assistsCourses = response.assistsCourses;

    // fetch('/api/roomList')
    //   .then(res => res.json())
    //   .then((data) => {
    //     this.rooms = data.list;
    //   })
    //   .catch(console.error);
  },
};
</script>
