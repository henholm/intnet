<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1" style="text-align: center">
      <h2>Courses {{user.username}} can administer</h2>
      <div class="btn-group">
        <div v-for="course in courses" v-bind:key="course.name">
          <button
            type="button"
            v-on:click="remove($event, course.name)"
            class="a-open"
            ref="TS.id"
          >{{course.name}}</button>
        </div>
      </div>
      <div>
        <br>
        <h5>To add a new course, please input the desired course name.</h5>
        <form @submit="checkForm">
          <p>
            <label for="courseName">E.g. "course6"</label>
            <input type="text" id="courseName" v-model="courseName" required />
          </p>
          <input class="btn btn-default" type="submit" value="OK"/>
        </form>
      </div>
      <div>
        <br>
        <h4>{{this.msg}}</h4>
      </div>
    </section>
  </div>
</template>

<script>
import RoutingService from '@/services/RoutingService';

export default {
  name: 'AdminCourses',
  components: {},
  data() {
    return {
      msg: '',
      courseName: null,
      user: null,
      courses: [],
      socket: null,
    };
  },
  methods: {
    remove(event, courseName) {
      event.preventDefault();
      this.socket.emit('removeCourse', { courseName });
    },
    addCourse(courseName) {
      const payload = { courseName };
      this.socket.emit('addCourse', payload);
    },
    checkForm(event) {
      if (this.courseName) {
        this.addCourse(this.courseName);
      }
      event.preventDefault();
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

    const res = await RoutingService.getCourses(this.user);
    this.courses = res.response.administersCourses;
  },
  // Step 4 in the lifecycle hooks.
  async mounted() {
    this.socket.on('updateCourses', (data) => {
      this.courses = [];
      for (let i = 0; i < data.courses.length; i += 1) {
        const course = {
          id: data.courses[i].id,
          name: data.courses[i].name,
        };
        this.courses.push(course);
      }
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
