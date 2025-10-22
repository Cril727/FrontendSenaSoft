<template>
  <q-page-container class="page-bg" style="padding: 4%;">
    <div class="hero">
      <div class="promo">
        <img src="../assets/promotion.png" alt="promo" class="promo-img" style="width: 2000px; height: 100%;"/>
      </div>
    </div>

    <div class="search-card">
      <div class="search-title">SEARCH AND FIND YOUR FLIGHT</div>
      <div class="search-row">
        <q-select
          filled
          dense
          v-model="form.origin"
          :options="originOptions"
          label="CITY OF ORIGIN"
          class="select"
          option-label="city"
          option-value="id"
          emit-value
          map-options
        />
        <q-select
          filled
          dense
          v-model="form.destination"
          :options="destinationOptions"
          label="DESTINATION CITY"
          class="select"
          option-label="city"
          option-value="id"
          emit-value
          map-options
        />
        <q-select
          filled
          dense
          v-model="form.passengers"
          :options="passengerOptions"
          label="NUMBER OF PASSENGERS"
          class="small-select"
        />
        <q-btn
          unelevated
          color="red"
          class="search-btn"
          @click="searchFlights"
          :loading="searching"
        >
          Search
        </q-btn>
      </div>
    </div>

    <div class="page-content">
      <!-- Loading state -->
      <div v-if="searching" class="text-center q-pa-lg">
        <q-spinner color="red" size="3em" />
        <div class="q-mt-md text-grey-7">Buscando vuelos...</div>
      </div>

      <!-- No results -->
      <div v-else-if="searchPerformed && flights.length === 0" class="text-center q-pa-lg">
        <q-icon name="flight_takeoff" size="4em" color="grey-5" />
        <div class="text-h6 q-mt-md text-grey-7">No se encontraron vuelos para esta ruta</div>
        <div class="text-body2 text-grey-6">Intenta con otras ciudades</div>
      </div>

      <!-- Results -->
      <div v-else-if="flights.length > 0" class="flights-grid">
        <q-card
          v-for="flight in flights"
          :key="flight.id"
          class="flight-card"
        >
          <q-card-section class="bg-red text-white">
            <div class="text-h6">{{ flight.origin?.city }} → {{ flight.destination?.city }}</div>
          </q-card-section>

          <q-card-section>
            <div class="flight-info">
              <div class="info-row">
                <q-icon name="schedule" color="grey-7" size="20px" />
                <span class="info-label">Salida:</span>
                <span class="info-value">{{ formatDate(flight.departure_at) }}</span>
              </div>
              <div class="info-row">
                <q-icon name="flight" color="grey-7" size="20px" />
                <span class="info-label">Avión:</span>
                <span class="info-value">{{ flight.airplane?.model || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <q-icon name="attach_money" color="green" size="20px" />
                <span class="info-label">Precio:</span>
                <span class="info-value price">${{ formatPrice(flight.price) }}</span>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <Button1
              label="Reservar"
              @click="reserveFlight(flight)"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Initial state -->
      <div v-else class="text-center q-pa-lg">
        <q-icon name="search" size="4em" color="grey-5" />
        <div class="text-h6 q-mt-md text-grey-7">Busca tu vuelo ideal</div>
        <div class="text-body2 text-grey-6">Selecciona origen y destino para comenzar</div>
      </div>
    </div>
  </q-page-container>
</template>

<script setup>
import { getData, postData } from '../services/apiClient.js'
import { ref, onMounted } from 'vue'
import { useNotifications } from '../composables/useNotifications.js'
import { useRouter } from 'vue-router'
import Button1 from '../components/button-1.vue'

const notify = useNotifications()
const router = useRouter()

const originOptions = ref([])
const destinationOptions = ref([])
const passengerOptions = [1,2,3,4,5].map(n => ({ label: String(n), value: n }))

const form = ref({
  origin: null,
  destination: null,
  passengers: 1
})

const flights = ref([])
const searching = ref(false)
const searchPerformed = ref(false)

// Cargar ciudades de origen
const loadOrigins = async () => {
  try {
    const res = await getData('/origins')
    if (res.success && res.city) {
      originOptions.value = res.city
    }
  } catch (error) {
    console.error('Error al cargar orígenes:', error)
    notify.error('Error al cargar ciudades de origen')
  }
}

// Cargar ciudades de destino
const loadDestinations = async () => {
  try {
    const res = await getData('/destinations')
    if (res.success && res.city) {
      destinationOptions.value = res.city
    }
  } catch (error) {
    console.error('Error al cargar destinos:', error)
    notify.error('Error al cargar ciudades de destino')
  }
}

// Buscar vuelos
const searchFlights = async () => {
  if (!form.value.origin || !form.value.destination) {
    notify.error('Por favor selecciona origen y destino')
    return
  }

  if (form.value.origin === form.value.destination) {
    notify.error('El origen y destino deben ser diferentes')
    return
  }

  searching.value = true
  searchPerformed.value = true

  try {
    const res = await postData('/searchFlights', {
      origin_id: form.value.origin,
      destination_id: form.value.destination
    })

    if (res.success) {
      flights.value = res.flights
      if (res.flights.length === 0) {
        notify.info('No se encontraron vuelos para esta ruta')
      } else {
        notify.success(`Se encontraron ${res.flights.length} vuelo(s)`)
      }
    }
  } catch (error) {
    console.error('Error al buscar vuelos:', error)
    notify.error('Error al buscar vuelos')
    flights.value = []
  } finally {
    searching.value = false
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

// Reservar vuelo
const reserveFlight = (flight) => {
  // Aquí puedes implementar la lógica de reserva
  notify.info('Funcionalidad de reserva en desarrollo')
  console.log('Reservar vuelo:', flight)
}

onMounted(() => {
  loadOrigins()
  loadDestinations()
})

</script>

<style scoped>
.page-bg {
  background: #e9e9e9;
  min-height: 100vh;
  padding-bottom: 40px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* header */
.app-header {
  background: #e60000; /* red */
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0;
}
.header-inner {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}
.brand-title {
  color: #fff;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: 0.5px;
}
.header-avatar img {
  object-fit: contain;
}

/* hero */
.hero {
  max-width: 1100px;
  margin: 22px auto 12px;
  text-align: center;
}
.hero-title {
  font-size: 34px;
  font-weight: 900;
  margin: 8px 0 16px;
}
.promo {
  display: flex;
  justify-content: center;
}
.promo-img {
  width: 90%;
  max-width: 1000px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  object-fit: cover;
}

/* search card */
.search-card {
  max-width: 1100px;
  margin: 18px auto;
  background: #d6d6d6;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.search-title {
  font-weight: 700;
  font-size: 13px;
  color: #333;
  margin-bottom: 6px;
}
.search-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.select {
  flex: 1;
  min-width: 180px;
  border-radius: 20px;
}
.small-select {
  width: 160px;
  border-radius: 20px;
}
.search-btn {
  min-width: 110px;
  background: #e60000;
  color: #fff;
  border-radius: 8px;
  height: 42px;
}
.search-btn:hover { filter: brightness(0.95); }

/* content area */
.page-content {
  max-width: 1100px;
  margin: 18px auto;
  min-height: 300px;
}

/* flights grid */
.flights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 10px;
}

.flight-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.flight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.flight-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 600;
  color: #666;
  min-width: 60px;
}

.info-value {
  color: #333;
}

.info-value.price {
  font-size: 1.2em;
  font-weight: bold;
  color: #2e7d32;
}

/* responsive */
@media (max-width: 900px) {
  .search-row { flex-direction: column; align-items: stretch; }
  .small-select, .search-btn { width: 100%; }
  .promo-img { width: 100%; }
  .flights-grid {
    grid-template-columns: 1fr;
  }
}
</style>