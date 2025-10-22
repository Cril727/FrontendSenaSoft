import { createRouter, createWebHashHistory } from "vue-router";
import mainLayout from "../layouts/mainLayout.vue";
import login from "../views/login.vue";
import dashboard from "../views/dashboard.vue";
import datosPersonales from "../views/datosPersonales.vue";
import pagar from "../views/pagar.vue";
import misReservas from "../views/misReservas.vue";
import crearCuenta from "../views/crearCuenta.vue";

const routes = [
  { path: "/", component: login},
  { path: "/crearCuenta", component: crearCuenta },
  {
    path: "/app", component: mainLayout, children: [
      { path: "dashboard", component: dashboard },
      { path: "datosPersonales", component: datosPersonales },
      { path: "pagar", component: pagar },
      { path: "misReservas", component: misReservas }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;