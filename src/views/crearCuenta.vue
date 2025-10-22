<template>
    <q-page-container class="page-container">
      <div class="flex flex-center content-top" style="padding-top: 0px; padding-bottom: 30px;">
        <q-card class="q-pa-md login-card">
          <h1 style="font-size: 40px;">Create Account</h1>
          <q-form @submit="onSubmit" class="form-container">
            <!-- Full Name -->
            <q-input filled v-model="form.full_name" label="Full Name" type="text" class="rounded-select"
              :rules="[val => !!val || 'Full name is required']">
              <template v-slot:prepend>
                <span class="material-symbols-outlined" style="font-size: 24px; color:#888">person</span>
              </template>
            </q-input>
            <!-- Email -->
            <q-input filled v-model="form.email" label="Email" type="text" class="rounded-select"
              :rules="[val => !!val || 'Email is required', val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format']">
              <template v-slot:prepend>
                <span class="material-symbols-outlined" style="font-size: 24px; color:#888">mail</span>
              </template>
            </q-input>
            <!-- Password -->
            <q-input filled v-model="form.password" label="Password" :type="showPassword ? 'text' : 'password'"
              class="rounded-select" :rules="[val => !!val || 'Password is required']">
              <template v-slot:prepend>
                <span class="material-symbols-outlined" style="font-size: 24px; color:#888">lock</span>
              </template>
              <template v-slot:append>
                <q-icon :name="showPassword ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                  @click="showPassword = !showPassword" />
              </template>
            </q-input>
            <!-- Create Account Button -->
            <div class="row justify-center" style="width: 100%; padding-top: 32px;">
              <Button1 type="submit" :loading="loading" customClass="wide-btn" label="Create Account" style="margin: 2%;" />
            </div>
          </q-form>
        </q-card>
      </div>
    </q-page-container>
</template>

<script setup>
import Button1 from '../components/button-1.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { postData } from '../services/apiClient.js'
import { useNotifications } from '../composables/useNotifications.js'

const router = useRouter()
const loading = ref(false)
const showPassword = ref(false)
const notify = useNotifications()

const form = ref({
  full_name: '',
  email: '',
  password: ''
})

const onSubmit = async () => {
  loading.value = true
  try {
    const response = await postData('/addUser', {
      full_name: form.value.full_name,
      email: form.value.email,
      password: form.value.password
    })

    if (response && response.success) {
      notify.success('Account created successfully')
      router.push('/')
    } else {
      notify.error(response.msg || 'Could not create account')
    }
  } catch (error) {
    console.error('Error creating account:', error)
    const errorMessage = error.response?.data?.errors?.[0] || 'Unexpected system error'
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