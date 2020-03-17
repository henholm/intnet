// src/router.js

import Vue from 'vue';
import VueRouter from 'vue-router';
import TimeSlotsView from './views/TimeSlots.vue';
import BookTimeSlotView from './views/BookTimeSlot.vue';
import StudentAdminView from './views/StudentAdmin.vue';
import AssistantAdminView from './views/AssistantAdmin.vue';
import LoginView from './views/Login.vue';
import store from './store';
import RoutingService from '@/services/RoutingService';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView, name: 'Login' },
  { path: '/timeSlots', component: TimeSlotsView, name: 'TimeSlots' },
  { path: '/bookTimeSlot/:timeSlotId', component: BookTimeSlotView, name: 'BookTimeSlot' },
  { path: '/studentAdmin/:studentName', component: StudentAdminView, name: 'StudentAdmin' },
  { path: '/assistantAdmin/:assistantId', component: AssistantAdminView, name: 'AssistantAdmin' },
];

const router = new VueRouter({
  // mode: 'hash',
  // Change mode to history, since 'hash' causes autofocus errors in Chrome.
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

// Check validity
// - renew sessionExpires if still valid
//   - next(to);
// - set isLoggedIn false and remove token if no longer valid
//   - next(Login)
router.beforeEach((to, from, next) => {
  // If not logged in but trying to access non-login route, redirect to login.
  if (to.name !== 'Login' && !store.getters.isLoggedIn) {
    next({ name: 'Login' });
  // If logged in and trying to access any route, check validity.
  } else if (store.getters.isLoggedIn) {
    const user = store.getters.getUser;
    // console.log(`Check validity of session for user ${user.username}`);
    RoutingService.checkValidSession(user).then((valid) => {
      if (valid) {
        next(to);
      } else {
        RoutingService.logout(user).then(() => {
          this.$store.dispatch('logout');
        }).catch((err) => {
          this.msg = err.response.data.msg;
        });
        next({ name: 'Login' });
      }
    });
  }
  next();
});

export default router;
