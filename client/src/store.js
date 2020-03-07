import Vue from 'vue';
import Vuex from 'vuex';
import Axios from 'axios';
import createPersistedState from 'vuex-persistedstate';

// import RoutingService from '@/services/RoutingService';

Vue.use(Vuex);

const getDefaultState = () => ({ token: '', user: {} });

// no-param-reassign prevents store.isAuthenticated = isAuthenticated
/* eslint-disable no-param-reassign */
export default new Vuex.Store({
  strict: true,
  plugins: [createPersistedState()],
  state: getDefaultState(),
  getters: {
    isLoggedIn: state => state.token,
    getUser: state => state.user,
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_USER: (state, user) => {
      state.user = user;
    },
    RESET: (state) => {
      Object.assign(state, getDefaultState());
    },
  },
  actions: {
    login: ({ commit }, { token, user }) => {
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
      // set auth header
      Axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    },
    // logout: ({ commit }, { userId }) => {
    logout: ({ commit }) => {
      // Use RoutingService
      commit('RESET', '');
    },
  },
  modules: {
  },
});
