import Vue from 'vue';
import io from 'socket.io-client';
import App from './App.vue';
import router from './router';
import store from './store';
import Axios from 'axios';

Vue.config.productionTip = false;

// set auth header
Axios.defaults.headers.common['Authorization'] = `Bearer ${store.state.token}`;

(async () => {
  // Find out if the user is already logged in
  // const { isAuthenticated } = await fetch('/api/isAuthenticated')
  //   .then(resp => resp.json())
  //   .catch(console.error);
  // store.commit('setIsAuthenticated', isAuthenticated);

  new Vue({
    router,
    store,
    render: h => h(App),
    data: {
      socket: io().connect(),
    },
  }).$mount('#app');
})();
