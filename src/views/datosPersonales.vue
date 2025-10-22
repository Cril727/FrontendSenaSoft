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
    const token = authStore?.token || JSON.parse(localStorage.getItem('auth') || '{}').token
    const res = await fetch(`/updatePassenger/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json().catch(() => ({}))

    if (res.status === 401) {
      notify.error('Session expired or unauthorized. Please log in again.')
      authStore.clearAuth && authStore.clearAuth()
      show.value = false
      return
    }

    if (res.ok) {
      notify.success(data.msg || 'Personal data updated')
      show.value = false
    } else {
      notify.error(data.msg || 'Could not update personal data')
      console.error('updateUser error', data)
    }
  } catch (error) {
    notify.error('Unexpected error while updating personal data')
    console.error('handleSave error', error)
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