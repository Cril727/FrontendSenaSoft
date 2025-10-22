# Guía de Autenticación - CondorTravels

## Resumen de Cambios

Se ha implementado un sistema completo de autenticación con JWT (JSON Web Tokens) que permite:

1. ✅ Todas las peticiones HTTP incluyen automáticamente el token de autenticación
2. ✅ Protección de rutas que requieren autenticación
3. ✅ Redirección automática al login si el token es inválido o expiró
4. ✅ Manejo centralizado de errores de autenticación
5. ✅ Logout que invalida el token en el servidor

## Arquitectura del Sistema

### 1. Interceptor de Axios (`pluginAxios.js`)

El archivo [`pluginAxios.js`](./src/plugins/pluginAxios.js) configura un cliente Axios con interceptores que:

**Request Interceptor:**
- Lee el token del localStorage en cada petición
- Agrega automáticamente el header `Authorization: Bearer {token}`
- No requiere configuración manual en cada llamada API

**Response Interceptor:**
- Detecta errores 401 (No autorizado)
- Limpia la autenticación local
- Redirige automáticamente al login

```javascript
// El token se agrega automáticamente a TODAS las peticiones
apiClient.interceptors.request.use((config) => {
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    const token = authData.token;
    
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
});
```

### 2. Protección de Rutas (`routes.js`)

Las rutas están protegidas con meta-campos y un navigation guard:

```javascript
// Rutas públicas (solo para usuarios no autenticados)
{ path: "/", component: login, meta: { requiresGuest: true } }

// Rutas protegidas (requieren autenticación)
{ path: "/app", component: mainLayout, meta: { requiresAuth: true } }
```

**Navigation Guard:**
- Verifica el estado de autenticación antes de cada navegación
- Redirige a login si se intenta acceder a rutas protegidas sin token
- Redirige a dashboard si un usuario autenticado intenta acceder al login

### 3. Store de Autenticación (`authStore.js`)

Maneja el estado global de autenticación usando Pinia:

```javascript
const authStore = useAuthStore()

// Guardar autenticación
authStore.setAuth(token, userData)

// Limpiar autenticación
authStore.clearAuth()

// Verificar estado
authStore.isAuthenticated
```

### 4. Cliente API (`apiClient.js`)

Proporciona funciones simplificadas para hacer peticiones HTTP:

```javascript
import { getData, postData, putData, deleteData } from '@/services/apiClient.js'

// GET - El token se incluye automáticamente
const flights = await getData('/flights')

// POST - El token se incluye automáticamente
const reservation = await postData('/addReservation', data)

// PUT - El token se incluye automáticamente
const updated = await putData('/updateUser/1', userData)

// DELETE - El token se incluye automáticamente
await deleteData('/deleteReservation/1')
```

## Flujo de Autenticación

### Login
1. Usuario ingresa credenciales en [`login.vue`](./src/views/login.vue)
2. Se envía POST a `/api/login`
3. Backend responde con token y datos del usuario
4. Token y usuario se guardan en el store (persiste en localStorage)
5. Usuario es redirigido a `/app/dashboard`

### Peticiones Autenticadas
1. Componente llama a `getData()`, `postData()`, etc.
2. Interceptor lee el token del localStorage
3. Agrega header `Authorization: Bearer {token}`
4. Backend valida el token con middleware `auth:api`
5. Si es válido, procesa la petición
6. Si es inválido (401), interceptor redirige al login

### Logout
1. Usuario hace clic en botón de logout en [`mainLayout.vue`](./src/layouts/mainLayout.vue)
2. Se envía POST a `/api/logout` (invalida token en servidor)
3. Se limpia el authStore (elimina token del localStorage)
4. Usuario es redirigido a `/`

## Configuración del Backend

El backend Laravel está configurado con:

### Rutas Protegidas (`api.php`)
```php
// Rutas públicas
Route::post("login", [AuthController::class, "login"]);
Route::post('/addUser', [UserController::class, 'store']);

// Rutas protegidas con middleware auth:api
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/myReservations', [ReservationController::class, 'myReservations']);
    // ... todas las demás rutas protegidas
});
```

### Configuración de Auth (`config/auth.php`)
```php
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

## Cómo Usar en Nuevos Componentes

### Ejemplo 1: Obtener Datos
```vue
<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '@/services/apiClient.js'

const flights = ref([])

const loadFlights = async () => {
  try {
    // El token se incluye automáticamente
    const response = await getData('/flights')
    flights.value = response.data
  } catch (error) {
    console.error('Error:', error)
    // Si es 401, el interceptor ya redirigió al login
  }
}

onMounted(() => {
  loadFlights()
})
</script>
```

### Ejemplo 2: Crear Reserva
```vue
<script setup>
import { postData } from '@/services/apiClient.js'
import { useNotifications } from '@/composables/useNotifications.js'

const notify = useNotifications()

const createReservation = async (reservationData) => {
  try {
    // El token se incluye automáticamente
    const response = await postData('/addReservation', reservationData)
    
    if (response.success) {
      notify.success('Reserva creada exitosamente')
    }
  } catch (error) {
    notify.error('Error al crear la reserva')
  }
}
</script>
```

### Ejemplo 3: Actualizar Usuario
```vue
<script setup>
import { putData } from '@/services/apiClient.js'
import { useAuthStore } from '@/store/authStore.js'

const authStore = useAuthStore()

const updateProfile = async (userData) => {
  try {
    const userId = authStore.user.id
    // El token se incluye automáticamente
    const response = await putData(`/updateUser/${userId}`, userData)
    
    // Actualizar el store con los nuevos datos
    authStore.setUser(response.data)
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
  }
}
</script>
```

## Testing

### Probar Autenticación
1. Iniciar el backend: `cd RetoSenaSoft && php artisan serve`
2. Iniciar el frontend: `cd FrontendSenaSoft && npm run dev`
3. Abrir http://localhost:5173
4. Intentar acceder a `/app/dashboard` sin login → debe redirigir a `/`
5. Hacer login con credenciales válidas
6. Verificar que se redirige a dashboard
7. Abrir DevTools → Network → ver que todas las peticiones incluyen header `Authorization`

### Probar Expiración de Token
1. Hacer login
2. En DevTools → Application → Local Storage → modificar o eliminar el token
3. Hacer cualquier acción que requiera API
4. Debe redirigir automáticamente al login

### Probar Logout
1. Hacer login
2. Hacer clic en el botón "me" → Logout
3. Verificar que se redirige a login
4. Verificar que el localStorage está limpio
5. Intentar acceder a rutas protegidas → debe redirigir a login

## Archivos Modificados

1. ✅ [`FrontendSenaSoft/src/plugins/pluginAxios.js`](./src/plugins/pluginAxios.js) - Interceptores de Axios
2. ✅ [`FrontendSenaSoft/src/router/routes.js`](./src/router/routes.js) - Protección de rutas
3. ✅ [`FrontendSenaSoft/src/layouts/mainLayout.vue`](./src/layouts/mainLayout.vue) - Logout mejorado
4. ✅ [`FrontendSenaSoft/src/views/misReservas.vue`](./src/views/misReservas.vue) - Uso correcto del API client
5. ✅ [`FrontendSenaSoft/src/views/datosPersonales.vue`](./src/views/datosPersonales.vue) - Uso correcto del API client

## Ventajas del Sistema Implementado

1. **Centralizado**: Un solo lugar maneja la autenticación
2. **Automático**: No necesitas agregar el token manualmente en cada petición
3. **Seguro**: Manejo consistente de errores de autenticación
4. **Mantenible**: Fácil de actualizar o modificar
5. **Escalable**: Funciona para cualquier número de endpoints

## Solución de Problemas

### Error: "Token not provided"
- Verificar que el usuario haya hecho login
- Verificar que el token esté en localStorage
- Verificar que el interceptor esté configurado correctamente

### Error: "Token invalid"
- El token puede haber expirado
- Hacer logout y login nuevamente
- Verificar configuración JWT en el backend

### Peticiones sin token
- Verificar que estés usando `getData`, `postData`, etc. de `apiClient.js`
- No usar `fetch` o `axios` directamente
- Verificar que el interceptor esté registrado

## Próximos Pasos

- [ ] Implementar refresh token para renovar tokens expirados
- [ ] Agregar indicador visual de estado de autenticación
- [ ] Implementar recordar sesión (remember me)
- [ ] Agregar logs de auditoría de autenticación