import { createRouter, createWebHashHistory } from "vue-router";
import mainLayout from "../layouts/mainLayout.vue";
import login from "../views/login.vue";
import dashboard from "../views/dashboard.vue";


const routes = [
  { path: "/", component: login },
  {
    path: "/app", component: mainLayout, children: [
      { path: "dashboard", component: dashboard }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;