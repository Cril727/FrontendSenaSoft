<template>
    <q-layout view="hHh lpR fFf">
        <q-header elevated class="text-white custom-header">
            <div class="header-container">
                <!-- Use a plain container for the logo so it doesn't get cropped into a circle -->
                <div class="header-logo">
                    <img src="/src/assets/condorblanco.png" alt="logo" style="height: 50px;" />
                </div>
                <span class="header-title">CONDORTRAVELS</span>
                <div class="header-action-btn">
                    <q-btn fab color="white" size="lg" @click="showMorph = !showMorph" unelevated>
                        <span style="font-weight:bold; color:#d32f2f;">me</span>
                    </q-btn>
                </div>
            </div>
        </q-header>

        <transition name="fade">
            <div v-if="showMorph" class="morph-float-card">
                <q-card class="bg-primary text-white"
                    style="width: 400px; border-radius: 1.5em; background-color: #dddddd !important;">
                    <q-card-section class="text-h6" style="color: black;">
                        ¡Hello <strong>{{ full_name || 'Username' }}</strong>, welcome!
                    </q-card-section>
                    <q-card-actions align="right">
                        <div class="button-row">
                            <Button1 label="Consult reservation" to="/app/misReservas" />
                            <Button1 label="Personal information" to="/app/datosPersonales" />
                            <q-btn flat round dense icon="logout" class="logout-btn" @click="logout"
                                :aria-label="'Log out'" />
                        </div>
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
        if (Auth.user.full_name) {
            full_name.value = Auth.user.full_name
        } else {
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

.header-logo {
    display: flex;
    align-items: center;
    margin-right: 16px;
    /* keep layout space similar to previous avatar */
}

.header-logo img {
    height: 90px;
    /* match header height so it fits nicely */
    width: auto;
    object-fit: contain;
    /* preserve whole image, no cropping */
    border-radius: 0;
    /* ensure not rounded */
    display: block;
}

/* keep the old header-avatar rule if present but don't let it force cropping */
.header-avatar {
    display: none;
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
}

.notifications-btn {
    margin: 0;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);

}

.q-footer {
    z-index: 1000;
}

.button-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    margin-top: 8px;
    font-size: 10px;

}
</style>