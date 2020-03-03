// src/views/Login.vue

<template>
  <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
    <h4>To log in, please enter your username and password.</h4>
    <!-- <form v-on:submit.prevent="login()"> -->
    <form @submit="checkForm">
      <p>
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" required autofocus />
      </p>
      <p>
        <label for="password">Password</label>
        <input type="text" id="password" v-model="password" required />
      </p>
      <!-- <input class="btn btn-default" type="submit" value="OK" v-on:click="login()"/> -->
      <input class="btn btn-default" type="submit" value="OK"/>
    </form>
    <div v-if="userNotExists">
      <br>
      <h4>User or password incorrect.</h4>
    </div>
  </div>
</template>


<script>
import AuthService from '@/services/AuthService';

export default {
  name: 'UserLogin',
  components: {},
  data() {
    return {
      username: '',
      password: '',
      userExists: true,
    };
  },
  methods: {
    checkForm(e) {
      if (this.username && this.password) {
        this.login();
      }
      e.preventDefault();
    },
    async login() {
      try {
        const credentials = {
          username: this.username,
          password: this.password,
        };
        const response = await AuthService.login(credentials);

        const { token } = response;
        const { user } = response;

        this.$store.dispatch('login', { token, user });
        this.$router.push('/timeSlots');
      } catch (error) {
        console.log('error.response.data.msg');
        this.msg = error.response.data.msg;
      }
    },
  },
};
</script>
