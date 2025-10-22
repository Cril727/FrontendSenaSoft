<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header con logo y título -->
    <q-header elevated class="text-white" style="background-color: #d32f2f; height: 90px;">
      <div
        style="position: relative; height: 90px; width: 100%; display: flex; align-items: center; justify-content: center;">
        <q-avatar size="90px"
          style="position: absolute; left: 0; top: 0; bottom: 0; margin: auto 0 auto 16px; z-index: 5; background: #e53935; display: flex; align-items: center; justify-content: center;">
          <img src="/src/assets/condorblanco.png" style="height: 90px; width: auto; background-color: #d32f2f;" />
        </q-avatar>
        <span style="font-size: 3rem; font-weight: bold; line-height: 80px;">CONDORTRAVELS</span>
      </div>
    </q-header>

    <q-page-container class="page-container">
      <div class="flex flex-center content-top" style="padding-top: 40px; padding-bottom: 30px;">
        <q-card class="q-pa-md login-card">
          <h1 style="font-size: 40px;">Login CondorTravels</h1>
          <q-form @submit="onSubmit" class="form-container">
            <!-- Input de correo -->
            <q-input filled v-model="form.email" label="EMAIL" type="text" class="rounded-select"
              :rules="[val => !!val || 'El correo es requerido', val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'invalid email format, example@gmail.com']">
              <template v-slot:prepend>
                <span class="material-symbols-outlined" style="font-size: 24px; color:#888">mail</span>
              </template>
            </q-input>

            <!-- Campo de contraseña común para todos -->
            <q-input filled v-model="form.password" label="PASSWORD" :type="showPassword ? 'text' : 'password'"
              class="rounded-select" :rules="[val => !!val || 'The password is  required']">
              <template v-slot:prepend>
                <span class="material-symbols-outlined" style="font-size: 24px; color:#888">lock</span>
              </template>
              <template v-slot:append>
                <q-icon :name="showPassword ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                  @click="showPassword = !showPassword" />
              </template>
            </q-input>
            <!-- Botón de ingreso -->
            <div class="row justify-center" style="width: 100%; padding-top: 32px;">
              <Button1 type="submit" :loading="loading" customClass="wide-btn" label="login" style="margin: 2%;" />
              <Button1 to="/crearCuenta" :loading="loading" customClass="wide-btn" label="create account" style="margin: 2%;" />
            </div>
          </q-form>
        </q-card>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import Button1 from '../components/button-1.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { postData } from '../services/apiClient.js'
import { useNotifications } from '../composables/useNotifications.js'
import { useAuthStore } from '../store/authStore.js'

const router = useRouter()
const loading = ref(false)
const showPassword = ref(false)
const notify = useNotifications()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const onSubmit = async () => {
  loading.value = true
  try {
    const response = await postData('/login', {
      email: form.value.email,
      password: form.value.password
    })

    if (response && response.token) {
      authStore.setAuth(response.token, response.user)
      router.push('/app/dashboard')
      notify.success(response.msg || 'WELCOME')
    } else {
      notify.error('Respuesta del servidor inválida')
    }
  } catch (error) {
    console.error('Error en el login:', error)
    const errorMessage = error.response?.data?.errors?.[0] || 'Error inesperado en el sistema'
    notify.error(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style>
.login-card {
  width: 600px;
  border: 3px solid #ff0000;
  border-radius: 24px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 0 !important;
}

.form-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rounded-select {
  width: 100%;
  margin-bottom: 1rem;
}

.rounded-select :deep(.q-field__control) {
  border-radius: 10px !important;
}

.rounded-select :deep(.q-field__marginal) {
  height: 56px;
}

.wide-btn {
  width: 190px;
  font-size: 1.1rem;
  padding: 14px 0;
}

.material-symbols-outlined {
  color: #888;
}

.content-top {
  align-items: flex-start !important;
}

.page-container {
  height: auto;
  padding: 0;
  overflow-y: auto;
}

.flex.flex-center {
  min-height: auto !important;
}
</style>