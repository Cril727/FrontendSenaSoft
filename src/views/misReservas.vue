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
            <div><strong>Origen:</strong> {{ reservation.flight.origin?.city || 'N/A' }}</div>
            <div><strong>Destino:</strong> {{ reservation.flight.destination?.city || 'N/A' }}</div>
            <div><strong>Fecha de salida:</strong> {{ formatDate(reservation.flight.departure_at) }}</div>
            <div v-if="reservation.flight.airplane"><strong>Avión:</strong> {{ reservation.flight.airplane.model }}</div>
            <div v-if="reservation.flight_seats && reservation.flight_seats.length > 0">
              <strong>Asiento:</strong> {{ reservation.flight_seats[0].seat?.code || 'N/A' }}
            </div>
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
          </div>
          <div v-if="reservation.payer" class="q-mt-sm">
            <div class="text-caption text-grey-7">Pagador</div>
            <div><strong>Nombre:</strong> {{ reservation.payer.full_name }}</div>
            <div><strong>Email:</strong> {{ reservation.payer.email }}</div>
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

        <q-separator />

        <q-card-actions align="right" v-if="reservation.status === 'confirmed' || reservation.status === 'paid'">
        </q-card-actions>
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
    
    console.log('Respuesta completa:', res)
    
    if (res && res.success && res.reservations) {
      reservations.value = res.reservations
      console.log('Reservas cargadas:', res.reservations)
      
      if (res.reservations.length === 0) {
        notify.info('No tienes reservas aún')
      }
    } else {
      console.log('Formato de respuesta inesperado:', res)
      notify.warning('No se encontraron reservas')
    }
  } catch (error) {
    console.error('Error al cargar reservas:', error)
    console.error('Detalles del error:', error.response?.data)
    notify.error('Error al cargar las reservas: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  const colors = {
    'pending': 'orange',
    'confirmed': 'green',
    'paid': 'green',
    'canceled': 'red'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Pendiente',
    'confirmed': 'Confirmado',
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

// Obtener el código base de referencia 
const getBaseReferenceCode = (code) => {
  // Si el código tiene formato REF-XXX-1, REF-XXX-2, extraer solo REF-XXX
  const match = code.match(/^(.+)-\d+$/)
  return match ? match[1] : code
}

// Función para descargar tickets
const downloadTickets = (referenceCode) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const downloadUrl = `${apiUrl}/api/tickets/download/${referenceCode}`
  
  window.open(downloadUrl, '_blank')
  notify.success('Descargando tickets...')
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

