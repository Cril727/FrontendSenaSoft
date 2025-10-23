<template>
  <q-page-container class="page-bg">
    <div class="container">
      <!-- Header -->
      <q-card class="header-card q-mb-md">
        <q-card-section class="bg-red text-white">
          <div class="text-h5">Confirmar Reserva y Pago</div>
          <div class="text-subtitle2">Completa los datos de todos los pasajeros</div>
        </q-card-section>
      </q-card>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-lg">
        <div class="spinner"></div>
        <div class="q-mt-md text-grey-7">Procesando...</div>
      </div>

      <!-- Main Content -->
      <div v-else class="row q-col-gutter-md">
        <!-- Formulario -->
        <div class="col-12 col-md-7">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Datos del Pagador</div>
              
              <q-form @submit="processPayment" class="q-gutter-md">
                <q-input
                  v-model="payerData.full_name"
                  label="Nombre Completo *"
                  outlined
                  :rules="[val => !!val || 'Campo requerido']"
                />

                <q-input
                  v-model="payerData.email"
                  label="Email *"
                  type="email"
                  outlined
                  :rules="[
                    val => !!val || 'Campo requerido',
                    val => /.+@.+\..+/.test(val) || 'Email inválido'
                  ]"
                />

                <q-input
                  v-model="payerData.phone"
                  label="Teléfono *"
                  outlined
                  mask="(###) ### ####"
                  :rules="[val => !!val || 'Campo requerido']"
                />

                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-select
                      v-model="payerData.document_type"
                      :options="documentTypes"
                      label="Tipo de Documento *"
                      outlined
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model="payerData.document_number"
                      label="Número de Documento *"
                      outlined
                      :rules="[val => !!val || 'Campo requerido']"
                    />
                  </div>
                </div>

                <q-separator class="q-my-md" />

                <!-- Formularios dinámicos para cada pasajero -->
                <div 
                  v-for="(passenger, index) in passengersData" 
                  :key="index"
                  class="passenger-section"
                >
                  <div class="text-h6 q-mb-md">
                    Pasajero {{ index + 1 }} - Asiento {{ reservationData.selectedSeats[index]?.code }}
                  </div>

                  <q-input
                    v-model="passenger.full_name"
                    :label="`Nombre Completo del Pasajero ${index + 1} *`"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                  />

                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div class="col-6">
                      <q-select
                        v-model="passenger.document_type"
                        :options="documentTypes"
                        label="Tipo de Documento *"
                        outlined
                        :rules="[val => !!val || 'Campo requerido']"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model="passenger.document_number"
                        label="Número de Documento *"
                        outlined
                        :rules="[val => !!val || 'Campo requerido']"
                      />
                    </div>
                  </div>

                  <q-separator v-if="index < passengersData.length - 1" class="q-my-md" />
                </div>

                <q-card-actions align="right" class="q-mt-md">
                  <q-btn 
                    flat 
                    label="Cancelar" 
                    color="grey" 
                    @click="router.back()"
                  />
                  <q-btn 
                    type="submit"
                    unelevated 
                    label="Proceder al Pago" 
                    color="red"
                    icon="payment"
                    :loading="processing"
                  />
                </q-card-actions>
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <!-- Resumen -->
        <div class="col-12 col-md-5">
          <q-card class="sticky-card">
            <q-card-section class="bg-grey-2">
              <div class="text-h6">Resumen de Reserva</div>
            </q-card-section>

            <q-card-section>
              <div class="summary-item">
                <q-icon name="flight_takeoff" size="20px" color="red" />
                <div class="summary-content">
                  <div class="text-caption text-grey-7">Origen</div>
                  <div class="text-weight-medium">{{ reservationData.origin }}</div>
                </div>
              </div>

              <div class="summary-item">
                <q-icon name="flight_land" size="20px" color="red" />
                <div class="summary-content">
                  <div class="text-caption text-grey-7">Destino</div>
                  <div class="text-weight-medium">{{ reservationData.destination }}</div>
                </div>
              </div>

              <div class="summary-item">
                <q-icon name="event" size="20px" color="red" />
                <div class="summary-content">
                  <div class="text-caption text-grey-7">Fecha y Hora</div>
                  <div class="text-weight-medium">{{ formatDate(reservationData.departure) }}</div>
                </div>
              </div>

              <div class="summary-item">
                <q-icon name="event_seat" size="20px" color="red" />
                <div class="summary-content">
                  <div class="text-caption text-grey-7">Asientos Seleccionados</div>
                  <div class="text-weight-medium">
                    {{ reservationData.selectedSeats?.map(s => s.code).join(', ') }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ reservationData.selectedSeats?.length || 0 }} pasajero(s)
                  </div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="price-breakdown">
                <div class="price-item">
                  <span>Precio por asiento</span>
                  <span>${{ formatPrice(reservationData.price) }}</span>
                </div>
                <div class="price-item">
                  <span>Cantidad de asientos</span>
                  <span>{{ reservationData.selectedSeats?.length || 0 }}</span>
                </div>
                <q-separator class="q-my-sm" />
                <div class="price-item total">
                  <span class="text-h6">Total</span>
                  <span class="text-h6 text-green">${{ formatPrice(totalAmount) }}</span>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="bg-blue-1">
              <div class="text-caption">
                <q-icon name="info" color="blue" />
                Al hacer clic en "Proceder al Pago", serás redirigido a la pasarela de pagos segura de PayU.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Formulario oculto para PayU -->
    <form ref="payuForm" :action="payuUrl" method="post" style="display: none;">
      <input v-for="(value, key) in payuData" :key="key" :name="key" :value="value" />
    </form>
  </q-page-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postData } from '../services/apiClient.js'
import { useNotifications } from '../composables/useNotifications.js'

const router = useRouter()
const notify = useNotifications()

const loading = ref(false)
const processing = ref(false)
const reservationData = ref({})
const payuForm = ref(null)
const payuUrl = ref('')
const payuData = ref({})

const documentTypes = ['CC', 'CE', 'TI', 'PAS', 'NIT']

const payerData = ref({
  full_name: '',
  email: '',
  phone: '',
  document_type: 'CC',
  document_number: ''
})

// Array dinámico de pasajeros basado en la cantidad de asientos
const passengersData = ref([])

// Calcular monto total
const totalAmount = computed(() => {
  const price = parseFloat(reservationData.value.price) || 0
  const seats = reservationData.value.selectedSeats?.length || 0
  return price * seats
})

// Formatear precio
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO').format(price)
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

// Inicializar formularios de pasajeros
const initializePassengers = () => {
  const numberOfSeats = reservationData.value.selectedSeats?.length || 0
  passengersData.value = Array.from({ length: numberOfSeats }, () => ({
    full_name: '',
    document_type: 'CC',
    document_number: ''
  }))
}

// Procesar pago
const processPayment = async () => {
  processing.value = true
  
  try {
    // Validar que tengamos los datos de la reserva
    if (!reservationData.value.flightId || !reservationData.value.selectedSeats?.length) {
      notify.error('No hay datos de reserva. Por favor, selecciona asientos primero.')
      router.push('/app/dashboard')
      return
    }

    // Validar que todos los pasajeros tengan datos completos
    const allPassengersValid = passengersData.value.every(p => 
      p.full_name && p.document_type && p.document_number
    )

    if (!allPassengersValid) {
      notify.error('Por favor, completa los datos de todos los pasajeros')
      return
    }

    // Preparar datos para enviar al backend
    const paymentData = {
      flight_id: reservationData.value.flightId,
      seats: reservationData.value.selectedSeats.map(seat => ({
        id: seat.flightSeatId || seat.id
      })),
      payer: payerData.value,
      passengers: passengersData.value // Enviar array de pasajeros
    }

    console.log('Enviando datos de pago:', paymentData)

    // Crear orden de pago en el backend
    const response = await postData('/payment/create-order', paymentData)

    if (response.success) {
      notify.success('Redirigiendo a la pasarela de pagos...')
      
      // Configurar datos de PayU
      payuUrl.value = response.payuUrl
      payuData.value = response.payuData

      // Esperar un momento para que el DOM se actualice
      await new Promise(resolve => setTimeout(resolve, 100))

      // Enviar formulario a PayU
      if (payuForm.value) {
        payuForm.value.submit()
      }
    } else {
      notify.error('Error al crear la orden de pago')
    }
  } catch (error) {
    console.error('Error al procesar pago:', error)
    notify.error('Error al procesar el pago: ' + (error.response?.data?.message || error.message))
  } finally {
    processing.value = false
  }
}

// Cargar datos de la reserva desde sessionStorage
onMounted(() => {
  const storedData = sessionStorage.getItem('reservationData')
  
  if (storedData) {
    reservationData.value = JSON.parse(storedData)
    console.log('Datos de reserva cargados:', reservationData.value)
    
    // Inicializar formularios de pasajeros
    initializePassengers()
  } else {
    notify.warning('No hay datos de reserva. Redirigiendo...')
    router.push('/app/dashboard')
  }
})
</script>

<style scoped>
.page-bg {
  background: #e9e9e9;
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header-card {
  border-radius: 12px;
  overflow: hidden;
}

.sticky-card {
  position: sticky;
  top: 20px;
}

.passenger-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.summary-content {
  flex: 1;
}

.price-breakdown {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.price-item.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 2px solid #ddd;
}

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
  .sticky-card {
    position: relative;
    top: 0;
  }
}
</style>