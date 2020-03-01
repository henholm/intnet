
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
export default {
  name: 'AssistantLogin',
  components: {},
  data() {
    return {
      username: '',
      password: '',
      userNotExists: false,
    };
  },
  methods: {
    login() {
      // Add authentication. If authenticated, continue to fetching of data.
      fetch(`/api/assistantLogin/${this.username}/${this.password}`)
        .then(res => res.json())
        .then((response) => {
          if (response.isAuthenticated) {
            this.$router.push(`assistantLogin/${this.username}`);
          } else {
            this.userNotExists = true;
          }
        });
    },
    checkForm(e) {
      if (this.username && this.password) {
        this.login();
      }
      e.preventDefault();
    },
  },
};
</script>
