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
    <!-- <button @click="openpopup">Open popup</button> -->
    <popup :popupData="popupData" ></popup>
  </div>
</template>

<script>
import Axios from 'axios';
import RoutingService from '@/services/RoutingService';
import Popup from './Popup.vue';

export default {
  components: {
    popup: Popup,
  },
  data() {
    return {
      popupData: {
        header: 'Response 403 - Forbidden',
        body: 'Your session has expired. Please close this message and log in again.',
        display: 'none',
      },
    };
  },
  methods: {
    openpopup() {
      this.popupData.display = 'block';
    },
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
      if (error.response.status === 403 || error.response.status === 401) {
        this.popupData.display = 'block';
        this.$store.dispatch('logout');
        this.$router.push('/login').catch((err) => { console.log(err); });
      }
      return Promise.reject(error);
    });
    if (this.$store.getters.isLoggedIn) {
      const user = this.$store.getters.getUser;
      console.log(`Check validity of session for user ${user.username}`);
      RoutingService.checkValidSession(user).then((valid) => {
        if (!valid) {
          RoutingService.logout(user).then(() => {
            this.$store.dispatch('logout');
          }).catch((err) => {
            this.msg = err.response.data.msg;
          });
          this.$router.push('/login').catch(() => {});
        }
      }).catch((err) => {
        this.msg = err.response.data.msg;
      });
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
