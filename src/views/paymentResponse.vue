<template>
  <q-page-container class="page-bg">
    <div class="container">
      <q-card class="result-card">
        <!-- Success -->
        <div v-if="transactionState === '4'" class="text-center">
          <q-icon name="check_circle" size="80px" color="green" class="q-mb-md" />
          <div class="text-h4 text-green q-mb-md">¡Pago Exitoso!</div>
          <div class="text-body1 text-grey-7 q-mb-lg">
            Tu reserva ha sido confirmada exitosamente.
          </div>
          <div class="info-box q-mb-lg">
            <div class="info-item">
              <span class="label">Código de Referencia:</span>
              <span class="value">{{ referenceCode }}</span>
            </div>
          </div>
          <div class="q-mb-md">
            <q-btn
              unelevated
              color="green"
              label="Descargar Tickets (PDF)"
              icon="download"
              @click="downloadTickets"
              class="q-mr-sm q-mb-sm"
            />
            <q-btn
              unelevated
              color="red"
              label="Ver Mis Reservas"
              icon="event_seat"
              @click="router.push('/app/mis-reservas')"
              class="q-mr-sm q-mb-sm"
            />
          </div>
          <q-btn
            flat
            color="grey"
            label="Volver al Inicio"
            @click="router.push('/app/dashboard')"
          />
        </div>

        <!-- Pending -->
        <div v-else-if="transactionState === '7'" class="text-center">
          <q-icon name="schedule" size="80px" color="orange" class="q-mb-md" />
          <div class="text-h4 text-orange q-mb-md">Pago Pendiente</div>
          <div class="text-body1 text-grey-7 q-mb-lg">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme.
          </div>
          <div class="info-box q-mb-lg">
            <div class="info-item">
              <span class="label">Código de Referencia:</span>
              <span class="value">{{ referenceCode }}</span>
            </div>
          </div>
          <q-btn 
            unelevated 
            color="red" 
            label="Volver al Inicio" 
            @click="router.push('/app/dashboard')"
          />
        </div>

        <!-- Rejected -->
        <div v-else-if="transactionState === '6' || transactionState === '104'" class="text-center">
          <q-icon name="cancel" size="80px" color="red" class="q-mb-md" />
          <div class="text-h4 text-red q-mb-md">Pago Rechazado</div>
          <div class="text-body1 text-grey-7 q-mb-lg">
            Tu pago no pudo ser procesado. Por favor, intenta nuevamente.
          </div>
          <div class="info-box q-mb-lg">
            <div class="info-item">
              <span class="label">Código de Referencia:</span>
              <span class="value">{{ referenceCode }}</span>
            </div>
          </div>
          <q-btn 
            unelevated 
            color="red" 
            label="Intentar Nuevamente" 
            icon="refresh"
            @click="router.push('/app/dashboard')"
            class="q-mr-sm"
          />
          <q-btn 
            flat 
            color="grey" 
            label="Volver al Inicio" 
            @click="router.push('/app/dashboard')"
          />
        </div>

        <!-- Loading -->
        <div v-else class="text-center">
          <div class="spinner q-mb-md"></div>
          <div class="text-h6 text-grey-7">Procesando respuesta...</div>
        </div>
      </q-card>
    </div>
  </q-page-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotifications } from '../composables/useNotifications.js'

const route = useRoute()
const router = useRouter()
const notify = useNotifications()

const transactionState = ref(null)
const referenceCode = ref('')

// Función para descargar tickets
const downloadTickets = () => {
  if (!referenceCode.value) {
    notify.error('No se encontró el código de referencia')
    return
  }

  // Construir URL para descargar PDF
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const downloadUrl = `${apiUrl}/api/tickets/download/${referenceCode.value}`
  
  // Abrir en nueva ventana para descargar
  window.open(downloadUrl, '_blank')
  
  notify.success('Descargando tickets...')
}

onMounted(() => {
  // Obtener parámetros de la URL
  transactionState.value = route.query.transactionState
  referenceCode.value = route.query.referenceCode

  console.log('Respuesta de PayU:', {
    transactionState: transactionState.value,
    referenceCode: referenceCode.value,
    allParams: route.query
  })

  // Limpiar sessionStorage
  sessionStorage.removeItem('reservationData')

  // Mostrar notificación según el estado
  if (transactionState.value === '4') {
    notify.success('¡Pago exitoso! Tu reserva ha sido confirmada.')
  } else if (transactionState.value === '7') {
    notify.warning('Tu pago está pendiente de confirmación.')
  } else if (transactionState.value === '6' || transactionState.value === '104') {
    notify.error('El pago fue rechazado. Por favor, intenta nuevamente.')
  }
})
</script>

<style scoped>
.page-bg {
  background: #e9e9e9;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 600px;
  width: 100%;
}

.result-card {
  padding: 40px;
  border-radius: 12px;
}

.info-box {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  font-weight: bold;
  color: #333;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #e60000;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>