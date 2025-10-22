import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "../store/authStore.js";
import mainLayout from "../layouts/mainLayout.vue";
import login from "../views/login.vue";
import dashboard from "../views/dashboard.vue";
import datosPersonales from "../views/datosPersonales.vue";
import pagar from "../views/pagar.vue";
import misReservas from "../views/misReservas.vue";
import crearCuenta from "../views/crearCuenta.vue";

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
    path: "/app",
    component: mainLayout,
    meta: { requiresAuth: true },
    children: [
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

// Navigation guard para proteger rutas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/');
  }
  // Si la ruta es para invitados (login/registro) y el usuario ya está autenticado
  else if (to.meta.requiresGuest && isAuthenticated) {
    next('/app/dashboard');
  }
  // En cualquier otro caso, permitir la navegación
  else {
    next();
  }
});

export default router;