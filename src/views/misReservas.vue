<template>
  <q-page-container class="q-pa-md">
    <div class="text-h4 q-mb-md">Mis Reservas</div>
    
    <q-card v-if="loading" class="q-pa-md">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md">Cargando reservas...</div>
    </q-card>

    <div v-else-if="reservations.length === 0" class="text-center q-pa-md">
      <q-icon name="flight_takeoff" size="4em" color="grey" />
      <div class="text-h6 q-mt-md">No tienes reservas aún</div>
    </div>

    <div v-else class="q-gutter-md">
      <q-card v-for="reservation in reservations" :key="reservation.id" class="q-pa-md">
        <q-card-section>
          <div class="text-h6">Reserva #{{ reservation.id }}</div>
          <div class="text-subtitle2">{{ reservation.flight_info }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore.js'
import { getData } from '../services/apiClient.js'
import { useNotifications } from '../composables/useNotifications.js'

const auth = useAuthStore()
const notify = useNotifications()
const loading = ref(false)
const reservations = ref([])

const loadReservations = async () => {
  loading.value = true
  try {
    // El token se agrega automáticamente por el interceptor
    const res = await getData('/myReservations')
    
    if (res && res.data) {
      reservations.value = res.data
      console.log('Reservas cargadas:', res.data)
    }
  } catch (error) {
    console.error('Error al cargar reservas:', error)
    notify.error('Error al cargar las reservas')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReservations()
})
</script>

<style scoped>
.q-page-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>