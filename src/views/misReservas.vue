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
      <q-card v-for="reservation in reservations" :key="reservation.id" class="reservation-card">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6">Código: {{ reservation.code }}</div>
              <q-badge :color="getStatusColor(reservation.status)" :label="getStatusLabel(reservation.status)" />
            </div>
            <div class="text-h5 text-primary">${{ reservation.worth }}</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm">
            <q-icon name="flight" /> Información del Vuelo
          </div>
          <div v-if="reservation.flight">
            <div><strong>Origen:</strong> {{ reservation.flight.origin?.name || 'N/A' }}</div>
            <div><strong>Destino:</strong> {{ reservation.flight.destination?.name || 'N/A' }}</div>
            <div><strong>Fecha de salida:</strong> {{ formatDate(reservation.flight.departure_date) }}</div>
            <div><strong>Hora de salida:</strong> {{ reservation.flight.departure_time }}</div>
            <div><strong>Duración:</strong> {{ reservation.flight.duration }} horas</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm">
            <q-icon name="person" /> Información del Pasajero
          </div>
          <div v-if="reservation.passenger">
            <div><strong>Nombre:</strong> {{ reservation.passenger.full_name }}</div>
            <div><strong>Documento:</strong> {{ reservation.passenger.document_type }} {{ reservation.passenger.document_number }}</div>
            <div><strong>Email:</strong> {{ reservation.passenger.email }}</div>
            <div><strong>Teléfono:</strong> {{ reservation.passenger.phone }}</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-subtitle2 text-grey-7">Número de asientos</div>
              <div class="text-h6">{{ reservation.number_of_positions }}</div>
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7">Fecha de reserva</div>
              <div>{{ formatDate(reservation.created_at) }}</div>
            </div>
          </div>
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
    
    if (res && res.data && res.data.reservations) {
      reservations.value = res.data.reservations
      console.log('Reservas cargadas:', res.data.reservations)
    }
  } catch (error) {
    console.error('Error al cargar reservas:', error)
    notify.error('Error al cargar las reservas')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  const colors = {
    'pending': 'orange',
    'paid': 'green',
    'canceled': 'red'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Pendiente',
    'paid': 'Pagado',
    'canceled': 'Cancelado'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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

.reservation-card {
  border-left: 4px solid var(--q-primary);
  transition: transform 0.2s, box-shadow 0.2s;
}

.reservation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>

