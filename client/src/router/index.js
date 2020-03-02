import Vue from 'vue';
import VueRouter from 'vue-router';
import TimeSlotsView from '../views/TimeSlots.vue';
import BookTimeSlotView from '../views/BookTimeSlot.vue';
import AssistantLoginView from '../views/AssistantLogin.vue';
import AssistantAdminView from '../views/AssistantAdmin.vue';
import LoginView from '../views/Login.vue';
import store from '../store';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/Login' },
  // { path: '/', redirect: '/timeSlots' },
  { path: '/Login', component: LoginView },
  { path: '/timeSlots', component: TimeSlotsView },
  { path: '/bookTimeSlot/:timeSlotId', component: BookTimeSlotView },
  { path: '/assistantLogin', component: AssistantLoginView },
  { path: '/assistantLogin/:assistantName', component: AssistantAdminView },
];

const router = new VueRouter({
  // mode: 'hash',
  // Change mode to history, since 'hash' causes autofocus errors in Chrome.
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

// Setup Authentication guard
router.beforeEach((to, from, next) => {
  if (store.state.isAuthenticated || to.path === '/login') {
    next();
  } else {
    console.info('Unauthenticated user. Redirecting to login page.');
    next('/login');
  }
});

export default router;
