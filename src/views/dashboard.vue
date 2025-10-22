<template>
  <q-page-container class="page-bg">
    <div class="hero">
      <h1 class="hero-title">TO LOVE IS TO FLY</h1>
      <div class="promo">
        <img src="../assets/promo-banner.png" alt="promo" class="promo-img" />
      </div>
    </div>

    <div class="search-card">
      <div class="search-title">SEARCH AND FIND YOUR FLIGHT</div>
      <div class="search-row">
        <q-select filled dense v-model="form.origin" :options="cities" label="CITY OF ORIGIN" class="select" />
        <q-select filled dense v-model="form.destination" :options="cities" label="DESTINATION CITY" class="select" />
        <q-select filled dense v-model="form.passengers" :options="passengerOptions" label="NUMBER OF PASSENGERS" class="small-select" />
        <q-btn unelevated color="red" class="search-btn" @click="onSearch">Search</q-btn>
      </div>
    </div>

    <!-- optional content area -->
    <div class="page-content">
      <!-- dashboard content goes here -->
    </div>
  </q-page-container>
</template>

<script setup>
import { ref } from 'vue'

const cities = [
  'MEDELLIN','CARTAGENA','SANTA MARTA','BOGOTA','POPAYAN',
  'TUMACO','PEREIRA','VILLAVICENCIO','SAN ANDRES','YOPAL'
].map(c => ({ label: c, value: c }))

const passengerOptions = [1,2,3,4,5].map(n => ({ label: String(n), value: n }))

const form = ref({
  origin: null,
  destination: null,
  passengers: 1
})

const onSearch = () => {
  // placeholder: actual request will be added later
  console.log('search', form.value)
}
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

/* responsive */
@media (max-width: 900px) {
  .search-row { flex-direction: column; align-items: stretch; }
  .small-select, .search-btn { width: 100%; }
  .promo-img { width: 100%; }
}
</style>