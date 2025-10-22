<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="text-white custom-header">
      <div class="header-container">
        <q-avatar size="90px" class="header-avatar">
          <img src="/src/assets/condorblanco.png" alt="logo" />
        </q-avatar>
        <span class="header-title">CONDORTRAVELS</span>
        <div class="header-action-btn">
          <q-btn fab color="white" size="lg" @click="showMorph = !showMorph" unelevated>
            <span style="font-weight:bold; color:#d32f2f;">yo</span>
          </q-btn>
        </div>
      </div>
    </q-header>

    <transition name="fade">
      <div v-if="showMorph" class="morph-float-card">
        <q-card class="bg-primary text-white"
          style="width: 320px; border-radius: 1.5em; background-color: #e53935 !important;">
          <q-card-section class="text-h6">
            ¡Hello <strong>{{ full_name || 'full_name' }}</strong>, welcome!
          </q-card-section>
          <q-card-actions align="right">
            <Button1 label="Consult reservation" to="/app/misReservas"/>
            <Button1 label="Personal information" to="/app/datosPersonales"/>
            <q-btn flat round dense icon="logout" class="logout-btn" @click="logout" :aria-label="'Cerrar sesión'" />
          </q-card-actions>
        </q-card>
      </div>
    </transition>

    <q-page-container style="max-width: 100% !important;">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import Button1 from '../components/button-1.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../store/authStore.js'

const showMorph = ref(false)
const full_name = ref('')
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()



// CARGUAR LA INFORMACION DEL USUARIO DESPLUES DE LOGUEARSE
onMounted(() => {
  const Auth = JSON.parse(localStorage.getItem("auth"))
  if (Auth.user) {
    if(Auth.user.full_name){
      full_name.value = Auth.user.full_name
    }else{
      const Names = Auth.user.name.split(" ")
      full_name.value = Names[0]
    }
  }
})


const logout = () => {
  try {
    authStore.clearAuth()

    $q.notify({
      message: 'Sesión cerrada correctamente',
      color: 'positive',
      icon: 'logout'
    })

    showMorph.value = false
    router.push('/')

  } catch (error) {
    $q.notify({
      message: 'Error al cerrar sesión',
      color: 'negative',
      icon: 'error'
    })
  }
}


</script>

<style scoped>
.q-layout,
.q-page-container {
  overflow: hidden;
}

.custom-header {
  background-color: #d32f2f;
  height: 90px;
  position: relative;
}

.header-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 90px;
  padding: 0 32px;
}

.header-avatar {
  position: static;
  margin-right: 16px;
}

.header-avatar img {
  width: auto;
}

.header-title {
  font-size: 3rem;
  font-weight: bold;
  line-height: 80px;
  color: white;
}

.header-action-btn {
  position: static;
}

.morph-float-card {
  position: fixed;
  top: 90px;
  right: 32px;
  z-index: 9999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.custom-footer {
  background-color: #f5f5f5;
  color: #333;
  text-align: center;
  padding: 0;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

.footer-text {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.notification-container {
  position: fixed;
  right: 16px;

  bottom: calc(var(--app-footer-height, 56px) + 16px);
  z-index: 14000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}


.notification-container>.q-card,
.notification-container>.q-btn {
  pointer-events: auto;
}

.notification-panel {
  margin-bottom: 12px;
  width: 360px;
  max-width: 90vw;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  color: #222;
  z-index: 15000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.note-thumb {
  width: 44px;
  height: 44px;
  background-color: #eee;
  background-size: cover;
  background-position: center;
  border-radius: 6px;
  background-image: url('/logo-del-sena-01.png');
}

.notifications-btn {
  margin: 0;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);

}

.q-footer {
  z-index: 1000;
}
</style>