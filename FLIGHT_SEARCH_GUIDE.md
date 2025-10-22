# Guía de Búsqueda de Vuelos - CondorTravels

## Resumen de la Funcionalidad

Se ha implementado un sistema completo de búsqueda de vuelos que permite:

1. ✅ Cargar ciudades de origen y destino desde el backend
2. ✅ Buscar vuelos entre dos ciudades específicas
3. ✅ Mostrar resultados en tarjetas visuales
4. ✅ Validación de formulario (origen y destino diferentes)
5. ✅ Manejo de estados (cargando, sin resultados, con resultados)

## Cambios Realizados

### Backend

#### 1. Nuevo Endpoint de Búsqueda ([`FlightController.php`](../RetoSenaSoft/app/Http/Controllers/FlightController.php:149))

```php
POST /api/searchFlights
```

**Parámetros:**
- `origin_id` (required): ID de la ciudad de origen
- `destination_id` (required): ID de la ciudad de destino

**Respuesta exitosa:**
```json
{
  "success": true,
  "flights": [
    {
      "id": 1,
      "departure_at": "2025-10-25 10:00:00",
      "price": "250000.00",
      "origin": {
        "id": 1,
        "city": "BOGOTA"
      },
      "destination": {
        "id": 2,
        "city": "MEDELLIN"
      },
      "airplane": {
        "id": 1,
        "model": "Boeing 737"
      }
    }
  ]
}
```

**Características:**
- Busca vuelos por origen Y destino simultáneamente
- Incluye relaciones (origin, destination, airplane) con `with()`
- Valida que los IDs existan en las tablas
- Retorna array vacío si no hay resultados (no error)

#### 2. Ruta Agregada ([`api.php`](../RetoSenaSoft/routes/api.php:63))

```php
Route::post('/searchFlights', [FlightController::class, 'searchFlights']);
```

**Nota:** Esta ruta está dentro del middleware `auth:api`, por lo que requiere autenticación.

### Frontend

#### 1. Vista Dashboard Actualizada ([`dashboard.vue`](./src/views/dashboard.vue:1))

**Nuevas Funcionalidades:**

##### Carga Dinámica de Ciudades
```javascript
// Carga ciudades de origen desde el backend
const loadOrigins = async () => {
  const res = await getData('/origins')
  originOptions.value = res.city
}

// Carga ciudades de destino desde el backend
const loadDestinations = async () => {
  const res = await getData('/destinations')
  destinationOptions.value = res.city
}
```

##### Búsqueda de Vuelos
```javascript
const searchFlights = async () => {
  const res = await postData('/searchFlights', {
    origin_id: form.value.origin,
    destination_id: form.value.destination
  })
  
  flights.value = res.flights
}
```

##### Validaciones
- Verifica que origen y destino estén seleccionados
- Valida que origen y destino sean diferentes
- Muestra notificaciones apropiadas

##### Estados de la UI
1. **Estado Inicial**: Mensaje invitando a buscar
2. **Cargando**: Spinner mientras busca
3. **Sin Resultados**: Mensaje cuando no hay vuelos
4. **Con Resultados**: Grid de tarjetas con vuelos

##### Tarjetas de Vuelos
Cada tarjeta muestra:
- Ruta (Origen → Destino)
- Fecha y hora de salida
- Modelo del avión
- Precio formateado
- Botón de reservar

## Cómo Usar

### 1. Preparar el Backend

Asegúrate de tener datos en las tablas:

```bash
cd RetoSenaSoft
php artisan tinker
```

```php
// Crear orígenes
\App\Models\Origin::create(['city' => 'BOGOTA']);
\App\Models\Origin::create(['city' => 'MEDELLIN']);
\App\Models\Origin::create(['city' => 'CARTAGENA']);

// Crear destinos
\App\Models\Destination::create(['city' => 'BOGOTA']);
\App\Models\Destination::create(['city' => 'MEDELLIN']);
\App\Models\Destination::create(['city' => 'CARTAGENA']);

// Crear un avión
\App\Models\Airplane::create(['model' => 'Boeing 737', 'capacity' => 180]);

// Crear vuelos de prueba
\App\Models\Flight::create([
    'departure_at' => '2025-10-25 10:00:00',
    'price' => 250000,
    'origin_id' => 1,      // BOGOTA
    'destination_id' => 2,  // MEDELLIN
    'airplane_id' => 1
]);

\App\Models\Flight::create([
    'departure_at' => '2025-10-25 15:00:00',
    'price' => 280000,
    'origin_id' => 1,      // BOGOTA
    'destination_id' => 3,  // CARTAGENA
    'airplane_id' => 1
]);
```

### 2. Iniciar Servidores

**Backend:**
```bash
cd RetoSenaSoft
php artisan serve
```

**Frontend:**
```bash
cd FrontendSenaSoft
npm run dev
```

### 3. Probar la Funcionalidad

1. Abrir http://localhost:5173
2. Hacer login con credenciales válidas
3. Ir al dashboard (se redirige automáticamente)
4. Seleccionar ciudad de origen (ej: BOGOTA)
5. Seleccionar ciudad de destino (ej: MEDELLIN)
6. Hacer clic en "Search"
7. Ver los resultados en tarjetas

## Casos de Prueba

### ✅ Caso 1: Búsqueda Exitosa
- **Acción**: Seleccionar BOGOTA → MEDELLIN
- **Resultado Esperado**: Muestra vuelos disponibles
- **Notificación**: "Se encontraron X vuelo(s)"

### ✅ Caso 2: Sin Resultados
- **Acción**: Seleccionar ruta sin vuelos (ej: MEDELLIN → BOGOTA si no hay)
- **Resultado Esperado**: Mensaje "No se encontraron vuelos"
- **Notificación**: "No se encontraron vuelos para esta ruta"

### ✅ Caso 3: Validación - Campos Vacíos
- **Acción**: Hacer clic en Search sin seleccionar origen/destino
- **Resultado Esperado**: No hace búsqueda
- **Notificación**: "Por favor selecciona origen y destino"

### ✅ Caso 4: Validación - Mismo Origen y Destino
- **Acción**: Seleccionar la misma ciudad en origen y destino
- **Resultado Esperado**: No hace búsqueda
- **Notificación**: "El origen y destino deben ser diferentes"

### ✅ Caso 5: Token de Autenticación
- **Acción**: Buscar vuelos estando autenticado
- **Resultado Esperado**: El token se envía automáticamente
- **Verificación**: En DevTools → Network → Headers debe aparecer `Authorization: Bearer {token}`

## Estructura de Datos

### Modelo Origin
```php
{
  "id": 1,
  "city": "BOGOTA",
  "created_at": "2025-10-22T...",
  "updated_at": "2025-10-22T..."
}
```

### Modelo Destination
```php
{
  "id": 1,
  "city": "MEDELLIN",
  "created_at": "2025-10-22T...",
  "updated_at": "2025-10-22T..."
}
```

### Modelo Flight (con relaciones)
```php
{
  "id": 1,
  "departure_at": "2025-10-25 10:00:00",
  "price": "250000.00",
  "origin_id": 1,
  "destination_id": 2,
  "airplane_id": 1,
  "origin": {
    "id": 1,
    "city": "BOGOTA"
  },
  "destination": {
    "id": 2,
    "city": "MEDELLIN"
  },
  "airplane": {
    "id": 1,
    "model": "Boeing 737",
    "capacity": 180
  }
}
```

## Características de la UI

### Diseño Responsivo
- Desktop: Grid de 3 columnas
- Tablet: Grid de 2 columnas
- Mobile: 1 columna

### Animaciones
- Hover en tarjetas: Elevación y sombra
- Transiciones suaves en todos los estados

### Formato de Datos
- **Fecha**: "25 de octubre de 2025, 10:00"
- **Precio**: "$250.000" (formato colombiano)

### Colores
- Rojo principal: `#e60000` (CondorTravels)
- Verde para precios: `#2e7d32`
- Grises para texto secundario

## Próximas Mejoras

- [ ] Filtrar por rango de fechas
- [ ] Filtrar por rango de precios
- [ ] Ordenar resultados (precio, fecha)
- [ ] Mostrar asientos disponibles
- [ ] Implementar funcionalidad de reserva
- [ ] Agregar paginación para muchos resultados
- [ ] Guardar búsquedas recientes
- [ ] Comparar vuelos

## Solución de Problemas

### No se cargan las ciudades
- Verificar que el backend esté corriendo
- Verificar que existan registros en `origins` y `destinations`
- Revisar console del navegador para errores

### No aparecen vuelos
- Verificar que existan vuelos con esos origin_id y destination_id
- Revisar en la base de datos: `SELECT * FROM flights WHERE origin_id = X AND destination_id = Y`

### Error 401 al buscar
- Verificar que el usuario esté autenticado
- Verificar que el token sea válido
- Revisar que el interceptor esté funcionando

### Vuelos sin información de ciudad/avión
- Verificar que las relaciones estén definidas en el modelo Flight
- Verificar que existan registros relacionados en las tablas

## Endpoints Relacionados

```
GET  /api/origins              - Obtener todas las ciudades de origen
GET  /api/destinations         - Obtener todas las ciudades de destino
POST /api/searchFlights        - Buscar vuelos (requiere auth)
GET  /api/flights              - Obtener todos los vuelos (requiere auth)
GET  /api/flightById/{id}      - Obtener vuelo por ID (requiere auth)
```

## Archivos Modificados

1. ✅ [`RetoSenaSoft/app/Http/Controllers/FlightController.php`](../RetoSenaSoft/app/Http/Controllers/FlightController.php) - Método `searchFlights()`
2. ✅ [`RetoSenaSoft/routes/api.php`](../RetoSenaSoft/routes/api.php) - Ruta `/searchFlights`
3. ✅ [`FrontendSenaSoft/src/views/dashboard.vue`](./src/views/dashboard.vue) - UI completa de búsqueda

## Conclusión

El sistema de búsqueda de vuelos está completamente funcional y listo para usar. Permite a los usuarios buscar vuelos entre dos ciudades de manera intuitiva, con validaciones apropiadas y una interfaz visual atractiva. Todos los datos se cargan dinámicamente desde el backend y el token de autenticación se maneja automáticamente.