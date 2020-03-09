<template>
  <div id="app">
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

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="navbar-brand-centered">
          <ul class="nav navbar-nav">
            <!-- <li v-on:click="redirect('/login')">
              <a style="cursor: pointer;">Login</a>
            </li>
            <li v-on:click="redirect('/list')">
              <a style="cursor: pointer;">Rooms</a>
            </li> -->
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
import RoutingService from '@/services/RoutingService';

export default {
  data: () => ({
    currentUser: null,
  }),
  methods: {
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
  created() {
    this.currentUser = this.$store.getters.getUser;
  },
};
</script>

<style>
  @import './assets/app.css';
</style>
