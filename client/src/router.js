import Vue from 'vue';
import VueRouter from 'vue-router';
import TimeSlotsView from './views/TimeSlots.vue';
import BookTimeSlotView from './views/BookTimeSlot.vue';
import StudentAdminView from './views/StudentAdmin.vue';
import AssistantAdminView from './views/AssistantAdmin.vue';
import LoginView from './views/Login.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/timeSlots', component: TimeSlotsView },
  { path: '/bookTimeSlot/:timeSlotId', component: BookTimeSlotView },
  { path: '/studentAdmin/:studentName', component: StudentAdminView },
  { path: '/assistantAdmin/:assistantId', component: AssistantAdminView },
];

const router = new VueRouter({
  // mode: 'hash',
  // Change mode to history, since 'hash' causes autofocus errors in Chrome.
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
