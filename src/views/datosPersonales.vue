<template>
  <div class="q-pa-md">
    <q-btn label="Edit personal data" color="primary" @click="show = true" />
    <modalBase v-model:modelValue="show">
      <template #title>
        ACCOUNT SETUP REQUIRED
      </template>

      <template #contenido>
        <datosForm
          :initial="user"
          title="Please complete this information, which will help make your experience with CONDORTRAVELS more enjoyable."
          @save="handleSave"
          @cancel="closeModal"
        />
      </template>

      <!-- remove default actions so the form controls the buttons -->
      <template #actions></template>
    </modalBase>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import modalBase from '../components/modalBase.vue'
import datosForm from '../components/datosForm.vue'
import { useNotifications } from '../composables/useNotifications.js'
// replace putData usage with a fetch that sends the auth token

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
    // get token from pinia store or localStorage
    const token = authStore?.token || JSON.parse(localStorage.getItem('auth') || '{}').token

    const res = await fetch(`/updatePassenger/${user.value.id}`, {
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
      // optional: clear auth and redirect to login
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