<template>
  <div id="app">
    <!-- <v-dialog/> -->
    <nav class="navbar navbar-default navbar-inverse navbar-static-top" role="navigation">
      <div class="container">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
          <button
            type="button"
            class="navbar-toggle"
            data-toggle="collapse"
            data-target="#navbar-brand-centered"
          >
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>

          <div
          class="navbar-brand navbar-brand-centered"
          style="line-height: 1em; cursor: pointer;"
        >{{currentUser}}</div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="navbar-brand-centered">
          <ul class="nav navbar-nav">
            <li v-on:click="redirect('/timeSlots')">
              <a style="cursor: pointer;">Time Slots</a>
            </li>
            <li v-on:click="redirectStudent()">
              <a style="cursor: pointer;">Student Admin</a>
            </li>
            <li v-on:click="redirectAssistant()">
              <a style="cursor: pointer;">Assistant Admin</a>
            </li>
            <li v-on:click="logout()">
              <a style="cursor: pointer;">Log Out</a>
            </li>
          </ul>
        </div>
        <!-- /.navbar-collapse -->
      </div>
      <!-- /.container-fluid -->
    </nav>
    <router-view :key="$route.fullPath"></router-view>
  </div>
</template>

<script>
import Axios from 'axios';
import RoutingService from '@/services/RoutingService';

export default {
  data: () => ({
  }),
  methods: {
    // showRedirectToLoginModal() {
    //   this.$modal.show('dialog', {
    //     title: 'Redirect to Login',
    //     text: 'Your session has expired. You have been redirect to the login page.',
    //     buttons: [{ title: 'Close' }],
    //   });
    // },
    // hideRedirectToLoginModal() {
    //   this.$modal.show('redirect-to-login');
    // },
    redirect(target) {
      this.$router.push(target).catch(() => {});
    },
    redirectStudent() {
      if (this.$store.getters.isLoggedIn) {
        this.$router.push(`/studentAdmin/${this.$store.getters.getUser.username}`)
          .catch(() => {});
      }
    },
    redirectAssistant() {
      if (this.$store.getters.getUser.isAssistant === 1) {
        this.$router.push(`/assistantAdmin/${this.$store.getters.getUser.username}`)
          .catch(() => {});
      }
    },
    async logout() {
      if (this.$store.getters.isLoggedIn) {
        const user = this.$store.getters.getUser;
        RoutingService.logout(user).then((response) => {
          console.log(response.msg);
          this.$store.dispatch('logout');
          this.$router.push('/login').catch(() => {});
        }).catch((err) => {
          console.log(err);
        });
      } else {
        this.$store.dispatch('logout');
        this.$router.push('/login').catch(() => {});
      }
    },
  },
  async created() {
    Axios.interceptors.response.use(response => response, (error) => {
      if (error.response.status === 403) {
        console.log('Redirect me to login');
        this.$store.dispatch('logout');
        this.$router.push('/login').catch(() => {});
        // showRedirectToLoginModal();
      }
      return Promise.reject(error);
    });
    if (this.$store.getters.isLoggedIn) {
      const user = this.$store.getters.getUser;
      await RoutingService.setLoggedIn(user);
      // const valid = await RoutingService.checkValidSession(user);
      // console.log(valid);
    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.getUser.username;
    },
  },
};
</script>

<style>
  @import './assets/app.css';
</style>
