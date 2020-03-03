

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
    // login() {
    //   // Add authentication. If authenticated, continue to fetching of data.
    //   fetch(`/api/assistantLogin/${this.username}/${this.password}`)
    //     .then(res => res.json())
    //     .then((response) => {
    //       if (response.isAuthenticated) {
    //         this.$router.push(`assistantLogin/${this.username}`);
    //       } else {
    //         this.userExists = false;
    //       }
    //     });
    // },
    login() {
      fetch('/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      }).then((resp) => {
        if (resp.ok) return resp;
        this.$store.commit('setIsAuthenticated', false);
        this.$router.push({
          path: 'login',
        });
        throw new Error(resp.text);
      }).then(() => {
        this.$store.commit('setIsAuthenticated', true);
        this.$router.push({
          path: 'timeSlots',
        });
      }).catch((error) => {
        console.error('Authentication failed unexpectedly');
        throw error;
      });
    },
  },
};
</script>
