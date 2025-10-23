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
    // Debug: show stored auth and responses to troubleshoot why /me may be empty
    console.debug('auth localStorage:', localStorage.getItem('auth'))

    const meRes = await getData('/me')
    console.debug('/me response:', meRes)

    // getData returns response.data, so check meRes.user directly
    if (!meRes || !meRes.user) {
      notify.error('No se pudo obtener la información del usuario')
      return
    }

    const currentUser = meRes.user
    const userEmail = currentUser.email
    
    if (!userEmail) {
      notify.error('No se pudo identificar el email del usuario')
      return
    }

    // Buscar el pasajero por email
    const passengersRes = await getData('/passengers')
    console.debug('/passengers response:', passengersRes)

    if (!passengersRes || !passengersRes.passengers) {
      notify.error('No se pudo obtener la información del pasajero')
      return
    }

    const passenger = passengersRes.passengers.find(p => p.email === userEmail)
    
    if (!passenger) {
      notify.error('No se encontró el pasajero asociado a tu cuenta')
      return
    }

    // Actualizar el pasajero
  console.debug('PUT payload:', payload)
  const res = await putData(`/updatePassenger/${passenger.id}`, payload)

    // putData returns response.data
    if (res && res.success) {
      notify.success(res.message || 'Datos personales actualizados')

      // Re-fetch passengers to obtain the updated passenger record from the API
      try {
        const refreshed = await getData('/passengers')
        console.debug('/passengers refreshed:', refreshed)

        if (refreshed && refreshed.passengers) {
          // Prefer matching by id when possible
          const updatedPassenger = refreshed.passengers.find(p => p.id === passenger.id) || refreshed.passengers.find(p => p.email === userEmail)

          if (updatedPassenger) {
            // Update auth store user and localStorage.auth.user so other parts of the app see the changes
            authStore.setUser(updatedPassenger)
            user.value = updatedPassenger

            // Keep token if present
            try {
              const authObj = JSON.parse(localStorage.getItem('auth') || '{}')
              authObj.user = updatedPassenger
              localStorage.setItem('auth', JSON.stringify(authObj))
            } catch (e) {
              console.warn('Unable to update localStorage auth.user:', e)
            }
          } else {
            console.warn('Updated passenger not found in refreshed list')
          }
        }
      } catch (e) {
        console.warn('Failed to refresh passengers after update:', e)
      }

      show.value = false
    } else {
      notify.error(res?.message || 'No se pudieron actualizar los datos personales')
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