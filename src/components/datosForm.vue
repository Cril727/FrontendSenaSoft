<template>
  <q-card class="p-md" style="min-width:720px; max-width:820px;">
    <q-card-section class="row items-center q-pa-none q-mb-md">
      <div class="text-h6">{{ title }}</div>
      <div class="text-subtitle2 q-ml-sm">{{ subtitle }}</div>
    </q-card-section>

    <q-form @submit.prevent="submit" class="q-gutter-md">
      <div class="row">
        <div class="col-6">
          <q-input filled v-model="form.full_name" label="Full name" :rules="[required]" />
        </div>
        <div class="col-6">
          <q-select filled v-model="form.type_document" :options="documentTypes" label="Document type" :rules="[required]" emit-value map-options />
        </div>
      </div>

      <div class="row">
        <div class="col-6">
          <q-input filled v-model="form.date_birth" label="Birthdate" mask="date" placeholder="YYYY/MM/DD" :rules="[required]" />
        </div>
        <div class="col-6">
          <q-input filled v-model="form.document" label="Document" :rules="[required]" />
        </div>
      </div>

      <div class="row">
        <div class="col-6">
          <q-select filled v-model="form.gender" :options="genderOptions" label="Gender" :rules="[required]" emit-value map-options />
        </div>
        <div class="col-6">
          <q-input filled v-model="form.phone" label="Phone" />
        </div>
      </div>

      <div class="row">
        <div class="col-6">
          <q-select filled v-model="form.condicien_infante" :options="infantOptions" label="Infant condition" emit-value map-options />
        </div>
        <div class="col-6">
          <q-input filled v-model="form.email" label="Email" :rules="[required, emailRule]" />
        </div>
      </div>

      <q-card-actions align="right" class="q-pt-lg">
        <q-btn unelevated color="positive" label="OK" :disable="!isValid" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
const $q = useQuasar()

const props = defineProps({
  initial: {
    type: Object,
    default: () => ({})
  },
  title: {
    type: String,
    default: 'Title'
  },
  subtitle: {
    type: String,
    default: ''
  }
})

const emits = defineEmits(['save', 'cancel'])

const form = ref({
  full_name: '',
  type_document: '',
  date_birth: '',
  document: '',
  gender: '',
  phone: '',
  condicien_infante: '',
  email: ''
})

watch(() => props.initial, (val) => {
  if (val && typeof val === 'object') {
    form.value = { ...form.value, ...val }
  }
}, { immediate: true })

const documentTypes = [
  { label: 'C.C', value: 'CC' },
  { label: 'Passport', value: 'pasaporte' },
  { label: 'T.I', value: 'TI' },
  { label: 'C.E', value: 'CE' },
]

const genderOptions = [
  { label: 'Male', value: 'Man' },
  { label: 'Female', value: 'Woman' },
  { label: 'Other', value: 'Other' }
]

const infantOptions = [
  { label: 'YES', value: true },
  { label: 'NO', value: false }
]

const required = val => !!val || 'Required'
const emailRule = val => {
  if (!val) return 'Required'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(val) || 'Invalid email'
}

const isValid = computed(() => {
  return !!form.value.full_name &&
         !!form.value.type_document &&
         !!form.value.date_birth &&
         !!form.value.document &&
         !!form.value.gender &&
         !!form.value.email &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
})

function submit () {
  // Convertir condicien_infante a booleano si es necesario
  const payload = {
    ...form.value,
    condicien_infante: form.value.condicien_infante === true || form.value.condicien_infante === 'true' || form.value.condicien_infante === 1
  }
  emits('save', payload)
}

function onCancel () {
  emits('cancel')
}
</script>

<style scoped>
/* spacing to match the provided mock */
.q-card { border-radius: 12px; }
.q-input, .q-select { border-radius: 12px; }
</style>