import Vue from 'vue';
import VueRouter from 'vue-router';
import TimeSlotsView from './views/TimeSlots.vue';
import BookTimeSlotView from './views/BookTimeSlot.vue';
import AssistantLoginView from './views/AssistantLogin.vue';
import AssistantAdminView from './views/AssistantAdmin.vue';
import LoginView from './views/Login.vue';
// import store from './store';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
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

export default router;
