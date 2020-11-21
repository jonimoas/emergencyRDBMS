import Vue from "vue";
import Router from "vue-router";
import Login from "./components/Login.vue";
import DB from "./components/DB.vue";
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "login",
      component: Login
    },
    { path: "/db", name: "db", component: DB }
  ]
});
