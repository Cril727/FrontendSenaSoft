import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "../store/authStore.js";
import mainLayout from "../layouts/mainLayout.vue";
import login from "../views/login.vue";
import dashboard from "../views/dashboard.vue";
import datosPersonales from "../views/datosPersonales.vue";
import pagar from "../views/pagar.vue";
import misReservas from "../views/misReservas.vue";
import crearCuenta from "../views/crearCuenta.vue";
import selectSeats from "../views/selectSeats.vue";
import paymentResponse from "../views/paymentResponse.vue";

const routes = [
  {
    path: "/",
    component: login,
    meta: { requiresGuest: true }
  },
  {
    path: "/crearCuenta",
    component: crearCuenta,
    meta: { requiresGuest: true }
  },
  {
    path: "/payment-response",
    component: paymentResponse,
    meta: { requiresAuth: true }
  },
  {
    path: "/app",
    component: mainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "dashboard", component: dashboard },
      { path: "datosPersonales", component: datosPersonales },
      { path: "pagar", component: pagar },
      { path: "misReservas", component: misReservas },
      { path: "selectSeats/:flightId", name: "selectSeats", component: selectSeats }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});


export default router;