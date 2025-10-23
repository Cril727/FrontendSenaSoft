<template>
  <div class="q-pa-md" style="display: flex; justify-content: center; align-items: center; height: 100%;">
      <template >
        ACCOUNT SETUP REQUIRED
      </template>
        <datosForm
          :initial="user"
          title="PERSONAL INFORMATION"
          subtitle="Please complete this information, which will help make your experience with CONDORTRAVELS more enjoyable."
          @save="handleSave"
        />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import datosForm from '../components/datosForm.vue'
import { useNotifications } from '../composables/useNotifications.js'
import { useAuthStore } from '../store/authStore.js'

const notify = useNotifications()
const show = ref(false)
const user = ref({})
const authStore = useAuthStore()

try {
  const Auth = JSON.parse(localStorage.getItem('auth') || '{}')
  if (Auth && Auth.user) user.value = Auth.user
} catch (e) {
  user.value = {}
}

const handleSave = async (payload) => {
  try {
    // Usar putData y getData del apiClient que ya incluye el token automáticamente
    const { putData, getData } = await import('../services/apiClient.js')
    
    // Obtener información del usuario autenticado usando /me
    const meRes = await getData('/me')
        
    if (!meRes || !meRes.data || !meRes.data.user) {
      notify.error('No se pudo obtener la información del usuario')
      return
    }

    const currentUser = meRes.data.user
    const userEmail = currentUser.email
    
    if (!userEmail) {
      notify.error('No se pudo identificar el email del usuario')
      return
    }

    // Buscar el pasajero por email
    const passengersRes = await getData('/passengers')
    
    if (!passengersRes || !passengersRes.data || !passengersRes.data.passengers) {
      notify.error('No se pudo obtener la información del pasajero')
      return
    }

    const passenger = passengersRes.data.passengers.find(p => p.email === userEmail)
    
    if (!passenger) {
      notify.error('No se encontró el pasajero asociado a tu cuenta')
      return
    }

    // Actualizar el pasajero
    const res = await putData(`/updatePassenger/${passenger.id}`, payload)

    if (res && res.data && res.data.success) {
      notify.success(res.data.message || 'Datos personales actualizados')
      // Actualizar el usuario en el store
      authStore.setUser({ ...currentUser, ...payload })
      user.value = { ...currentUser, ...payload }
      show.value = false
    } else {
      notify.error(res?.data?.message || 'No se pudieron actualizar los datos personales')
    }
  } catch (error) {
    console.error('Error al actualizar datos:', error)
    if (error.response?.status === 401) {
      notify.error('Sesión expirada. Por favor inicia sesión nuevamente.')
      authStore.clearAuth()
    } else {
      notify.error(error.response?.data?.message || 'Error inesperado al actualizar datos personales')
    }
  }
}

const closeModal = () => {
  show.value = false
}
</script>

<style scoped>
/* ajustes mínimos para que el botón no quede pegado al borde */
.q-pa-md {
  padding-top: 16px;
}
</style>