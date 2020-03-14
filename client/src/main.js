import Vue from 'vue';
import io from 'socket.io-client';
import Axios from 'axios';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

// set auth header
Axios.defaults.headers.common.Authorization = `Bearer ${store.state.token}`;

(async () => {
  new Vue({
    router,
    store,
    render: h => h(App),
    data: {
      socket: io().connect(),
    },
  }).$mount('#app');
})();
