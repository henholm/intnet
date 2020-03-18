<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">

      <div class="row">
        <div
          class="well"
          @click="redirectUsers()"
        >
          <div class="row" style="text-align: center;">
            <h4>
              <span>Administer users</span>
            </h4>
          </div>
        </div>
      </div>

      <div class="row">
        <div
          class="well"
          @click="redirectPrivileges()"
        >
          <div class="row" style="text-align: center;">
            <h4>
              <span>Administer privileges</span>
            </h4>
          </div>
        </div>
      </div>

      <div class="row">
        <div
          class="well"
          @click="redirectCourses()"
        >
          <div class="row" style="text-align: center;">
            <h4>
              <span>Administer courses</span>
            </h4>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script>
export default {
  name: 'AdminPage',
  components: {},
  data: () => ({
    username: '',
    socket: null,
  }),
  methods: {
    redirectUsers() {
      this.$router.push(`/admin/${this.username}/users`);
    },
    redirectPrivileges() {
      this.$router.push(`/admin/${this.username}/privileges`);
    },
    redirectCourses() {
      this.$router.push(`/admin/${this.username}/courses`);
    },
  },
  async created() {
    // If not authenticated , redirect to login page.
    if (!this.$store.getters.isLoggedIn || this.$store.getters.getUser.isAdmin !== 1) {
      this.$router.push('/login').catch(() => {});
    }

    this.socket = this.$root.socket;
    this.socket.connect();

    const user = this.$store.getters.getUser;
    this.username = user.username;
  },
  // Step 5 in lifecycle hooks.
  onUpdate() {
    if (!this.$store.getters.isLoggedIn || this.$store.getters.getUser.isAdmin !== 1) {
      this.$router.push('/login').catch(() => {});
    }
  },
};
</script>
