import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Vuecidity from "vuecidity";
import "../node_modules/vuecidity/dist/lib/vuecidity.min.css";
import VueCookies from "vue-cookies";
Vue.use(VueCookies);

Vue.use(Vuecidity);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
