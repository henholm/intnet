// src/views/Login.vue

<template>
  <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
    <h4>To log in, please enter your username and password.</h4>
    <form @submit="checkForm">
      <p>
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" required autofocus />
      </p>
      <p>
        <label for="password">Password</label>
        <input type="text" id="password" v-model="password" required />
      </p>
      <input class="btn btn-default" type="submit" value="OK"/>
    </form>
    <div>
      <br>
      <h4>{{this.msg}}</h4>
    </div>
    <!-- <div v-if="userExists !== true">
      <br>
      <h4>User or password incorrect.</h4>
    </div> -->
  </div>
</template>


<script>
import RoutingService from '@/services/RoutingService';

export default {
  name: 'UserLogin',
  components: {},
  data() {
    return {
      username: '',
      password: '',
      msg: '',
    };
  },
  methods: {
    checkForm(e) {
      if (this.username && this.password) {
        this.login();
      }
      e.preventDefault();
    },
    // Before logging in, have the current user log out.
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
    login() {
      // Have the current user log out before logging in with the new user.
      this.logout();
      const credentials = {
        username: this.username,
        password: this.password,
      };
      RoutingService.login(credentials).then((response) => {
        const { token } = response;
        const { user } = response;
        this.$store.dispatch('login', { token, user });
        this.$router.push('/timeSlots');
      }).catch((err) => {
        this.msg = err.response.data.msg;
      });
    },
  },
};
</script>
