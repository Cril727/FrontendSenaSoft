<template>
  <div class="q-pa-md">
      <template >
        ACCOUNT SETUP REQUIRED
      </template>
        <datosForm
          :initial="user"
          title="Please complete this information, which will help make your experience with CONDORTRAVELS more enjoyable."
          @save="handleSave"
          @cancel="closeModal"
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
    // Usar putData del apiClient que ya incluye el token automáticamente
    const { putData } = await import('../services/apiClient.js')
    const userId = user.value.id
    
    if (!userId) {
      notify.error('No se pudo identificar el usuario')
      return
    }

    const res = await putData(`/updateUser/${userId}`, payload)

    if (res && res.success) {
      notify.success(res.msg || 'Datos personales actualizados')
      // Actualizar el usuario en el store
      authStore.setUser({ ...user.value, ...payload })
      show.value = false
    } else {
      notify.error(res?.msg || 'No se pudieron actualizar los datos personales')
    }
  } catch (error) {
    console.error('Error al actualizar datos:', error)
    if (error.response?.status === 401) {
      notify.error('Sesión expirada. Por favor inicia sesión nuevamente.')
      authStore.clearAuth()
    } else {
      notify.error('Error inesperado al actualizar datos personales')
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