<template>
  <q-page-container class="page-bg">
    <div class="container">
      <!-- Flight Info Header -->
      <q-card class="flight-info-card q-mb-md">
        <q-card-section class="bg-red text-white">
          <div class="text-h5">{{ route.query.origin }} → {{ route.query.destination }}</div>
          <div class="text-subtitle2">{{ formatDate(route.query.departure) }}</div>
        </q-card-section>
        <q-card-section>
          <div class="info-grid">
            <div class="info-item">
              <q-icon name="flight" size="24px" color="grey-7" />
              <span class="info-label">Vuelo #{{ route.params.flightId }}</span>
            </div>
            <div class="info-item">
              <q-icon name="attach_money" size="24px" color="green" />
              <span class="info-label price">${{ formatPrice(route.query.price) }}</span>
            </div>
            <div class="info-item">
              <q-icon name="event_seat" size="24px" color="blue" />
              <span class="info-label">{{ selectedSeats.length }} asiento(s) seleccionado(s)</span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-lg">
        <div class="spinner"></div>
        <div class="q-mt-md text-grey-7">Cargando asientos disponibles...</div>
      </div>

      <!-- Seats Grid -->
      <div v-else-if="seats.length > 0" class="seats-section">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Selecciona tus asientos</div>
            
            <!-- Legend -->
            <div class="legend q-mb-lg">
              <div class="legend-item">
                <div class="seat-demo available"></div>
                <span>Disponible</span>
              </div>
              <div class="legend-item">
                <div class="seat-demo selected"></div>
                <span>Seleccionado</span>
              </div>
              <div class="legend-item">
                <div class="seat-demo occupied"></div>
                <span>Ocupado</span>
              </div>
            </div>

            <!-- Airplane Layout -->
            <div class="airplane-container">
              <div class="cockpit">
                <q-icon name="flight" size="40px" color="grey-5" />
              </div>
              
              <div class="seats-grid">
                <div 
                  v-for="seat in organizedSeats" 
                  :key="seat.id"
                  class="seat-row"
                >
                  <div class="row-label">{{ seat.row }}</div>
                  <div class="seats-in-row">
                    <button
                      v-for="seatItem in seat.seats"
                      :key="seatItem.id"
                      :class="[
                        'seat',
                        getSeatClass(seatItem),
                        { 'aisle-after': isAisleAfter(seatItem.column) }
                      ]"
                      :disabled="!seatItem.available"
                      @click="toggleSeat(seatItem)"
                    >
                      {{ seatItem.code }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn 
              flat 
              label="Cancelar" 
              color="grey" 
              @click="router.back()"
            />
            <q-btn 
              unelevated 
              label="Continuar con la reserva" 
              color="red" 
              :disable="selectedSeats.length === 0"
              @click="proceedToReservation"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- No Seats Available -->
      <div v-else class="text-center q-pa-lg">
        <q-icon name="event_seat" size="4em" color="grey-5" />
        <div class="text-h6 q-mt-md text-grey-7">No hay asientos disponibles</div>
        <q-btn 
          flat 
          label="Volver a búsqueda" 
          color="red" 
          class="q-mt-md"
          @click="router.push('/app/dashboard')"
        />
      </div>
    </div>
  </q-page-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getData } from '../services/apiClient.js'
import { useNotifications } from '../composables/useNotifications.js'

const route = useRoute()
const router = useRouter()
const notify = useNotifications()

const loading = ref(false)
const seats = ref([])
const selectedSeats = ref([])

// Cargar todos los asientos del vuelo
const loadAvailableSeats = async () => {
  loading.value = true
  try {
    const flightId = route.params.flightId
    const res = await getData(`/flights/${flightId}/available-seats`)
    
    console.log('Respuesta del servidor:', res)
    
    if (res.success && res.seats) {
      // Mapear TODOS los asientos (disponibles y ocupados)
      seats.value = res.seats.map(fs => ({
        id: fs.id,
        flightSeatId: fs.id,
        seatId: fs.seat_id,
        code: fs.seat?.code || 'N/A',
        class: fs.seat?.class || 'economy',
        available: fs.status === 'available', // Solo los 'available' son clickeables
        status: fs.status
      }))
      
      console.log('Asientos cargados:', seats.value.length)
      console.log('Asientos disponibles:', seats.value.filter(s => s.available).length)
      console.log('Asientos ocupados:', seats.value.filter(s => !s.available).length)
      
      if (seats.value.length === 0) {
        notify.warning('Este vuelo no tiene asientos configurados')
      }
    } else {
      notify.error('No se pudieron cargar los asientos')
    }
  } catch (error) {
    console.error('Error al cargar asientos:', error)
    notify.error('Error al cargar los asientos: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

// Organizar asientos por filas
const organizedSeats = computed(() => {
  const rows = {}
  
  console.log('Organizando asientos, total:', seats.value.length)
  
  seats.value.forEach(seat => {
    console.log('Procesando asiento:', seat.code)
    
    let row, column
    
    // Intentar formato "1A" (número primero)
    let match = seat.code.match(/^(\d+)([A-Z])$/)
    if (match) {
      row = match[1]
      column = match[2]
    } else {
      // Intentar formato "A1" (letra primero)
      match = seat.code.match(/^([A-Z])(\d+)$/)
      if (match) {
        column = match[1]
        row = match[2]
      }
    }
    
    if (row && column) {
      if (!rows[row]) {
        rows[row] = []
      }
      
      rows[row].push({
        ...seat,
        row,
        column
      })
      console.log(`✓ Asiento ${seat.code} → Fila ${row}, Columna ${column}`)
    } else {
      console.warn('Código de asiento no válido:', seat.code)
    }
  })
  
  console.log('Filas organizadas:', Object.keys(rows))
  
  // Convertir a array y ordenar
  const result = Object.keys(rows)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(row => ({
      row,
      seats: rows[row].sort((a, b) => a.column.localeCompare(b.column))
    }))
  
  console.log('Resultado organizado:', result)
  return result
})

// Obtener clase CSS del asiento
const getSeatClass = (seat) => {
  if (!seat.available) return 'occupied'
  if (selectedSeats.value.some(s => s.id === seat.id)) return 'selected'
  return 'available'
}

// Verificar si hay pasillo después de esta columna
const isAisleAfter = (column) => {
  // Típicamente el pasillo está después de C y antes de D
  return column === 'C'
}

// Seleccionar/deseleccionar asiento
const toggleSeat = (seat) => {
  if (!seat.available) return
  
  const index = selectedSeats.value.findIndex(s => s.id === seat.id)
  
  if (index > -1) {
    selectedSeats.value.splice(index, 1)
    notify.info(`Asiento ${seat.code} deseleccionado`)
  } else {
    selectedSeats.value.push(seat)
    notify.success(`Asiento ${seat.code} seleccionado`)
  }
}

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatear precio
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO').format(price)
}

// Continuar con la reserva
const proceedToReservation = () => {
  if (selectedSeats.value.length === 0) {
    notify.error('Debes seleccionar al menos un asiento')
    return
  }
  
  // Guardar información en sessionStorage para la siguiente página
  sessionStorage.setItem('reservationData', JSON.stringify({
    flightId: route.params.flightId,
    origin: route.query.origin,
    destination: route.query.destination,
    price: route.query.price,
    departure: route.query.departure,
    selectedSeats: selectedSeats.value
  }))
  
  // Redirigir a la página de pago/confirmación
  router.push('/app/pagar')
}

onMounted(() => {
  loadAvailableSeats()
})
</script>

<style scoped>
.page-bg {
  background: #e9e9e9;
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.flight-info-card {
  border-radius: 12px;
  overflow: hidden;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 500;
  color: #333;
}

.info-label.price {
  font-size: 1.2em;
  font-weight: bold;
  color: #2e7d32;
}

.seats-section {
  margin-bottom: 20px;
}

.legend {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seat-demo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #ddd;
}

.seat-demo.available {
  background: #4caf50;
  border-color: #4caf50;
}

.seat-demo.selected {
  background: #2196f3;
  border-color: #2196f3;
}

.seat-demo.occupied {
  background: #9e9e9e;
  border-color: #9e9e9e;
}

.airplane-container {
  background: linear-gradient(to bottom, #f5f5f5, #fff);
  border-radius: 20px;
  padding: 20px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cockpit {
  text-align: center;
  padding: 20px;
  border-bottom: 2px dashed #ddd;
  margin-bottom: 20px;
}

.seats-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row-label {
  width: 30px;
  text-align: center;
  font-weight: bold;
  color: #666;
  font-size: 14px;
}

.seats-in-row {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.seat {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  border: 2px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seat.available {
  background: #4caf50;
  border-color: #4caf50;
  color: white;
}

.seat.available:hover {
  background: #45a049;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.seat.selected {
  background: #2196f3;
  border-color: #2196f3;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.seat.occupied {
  background: #9e9e9e;
  border-color: #9e9e9e;
  color: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.seat.aisle-after {
  margin-right: 24px;
}

/* Spinner CSS */
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #e60000;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .seat {
    width: 38px;
    height: 38px;
    font-size: 10px;
  }
  
  .seat.aisle-after {
    margin-right: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>