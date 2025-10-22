# Guía de Sistema de Reserva de Asientos - CondorTravels

## Resumen

Se ha implementado un sistema completo de selección y reserva de asientos que permite:

1. ✅ Ver asientos disponibles en una cuadrícula visual tipo avión
2. ✅ Seleccionar múltiples asientos
3. ✅ Visualizar estados: disponible, seleccionado, ocupado
4. ✅ Navegación fluida desde búsqueda → selección de asientos → pago
5. ✅ Diseño responsive y animaciones

## Flujo de Usuario

### 1. Búsqueda de Vuelos ([`dashboard.vue`](./src/views/dashboard.vue))
- Usuario busca vuelos por origen y destino
- Se muestran vuelos disponibles en tarjetas
- Hace clic en "Reservar" en el vuelo deseado

### 2. Selección de Asientos ([`selectSeats.vue`](./src/views/selectSeats.vue))
- Se carga automáticamente la información del vuelo
- Se obtienen asientos disponibles desde el backend
- Usuario ve cuadrícula de asientos organizada por filas
- Puede seleccionar/deseleccionar asientos haciendo clic
- Continúa a la página de pago

### 3. Pago y Confirmación ([`pagar.vue`](./src/views/pagar.vue))
- Recibe información de vuelo y asientos seleccionados
- Usuario completa el proceso de pago
- Se crea la reserva en el backend

## Arquitectura Técnica

### Backend

#### Endpoint Existente
```
GET /api/flights/{flight_id}/available-seats
```

**Respuesta:**
```json
{
  "success": true,
  "available_seats": [
    {
      "id": 1,
      "flight_id": 1,
      "seat_id": 5,
      "status": "available",
      "hold_expires_at": null,
      "seat": {
        "id": 5,
        "code": "1A",
        "class": "economy",
        "airplane_id": 1
      }
    }
  ]
}
```

**Características:**
- Filtra solo asientos con status `available`
- Excluye asientos con `hold_expires_at` expirado
- Incluye información completa del asiento (código, clase)

#### Modelos Relacionados

**Seat (Asiento)**
```php
{
  "id": 1,
  "code": "1A",           // Código del asiento (fila + columna)
  "class": "economy",     // Clase: economy, business, first
  "airplane_id": 1
}
```

**FlightSeats (Asiento en Vuelo)**
```php
{
  "id": 1,
  "flight_id": 1,
  "seat_id": 5,
  "status": "available",  // available, held, sold
  "hold_expires_at": null // Timestamp de expiración de reserva temporal
}
```

### Frontend

#### Vista de Selección de Asientos ([`selectSeats.vue`](./src/views/selectSeats.vue))

**Componentes Principales:**

1. **Header de Información del Vuelo**
   - Ruta (Origen → Destino)
   - Fecha y hora de salida
   - Precio del vuelo
   - Contador de asientos seleccionados

2. **Leyenda**
   - Verde: Disponible
   - Azul: Seleccionado
   - Gris: Ocupado

3. **Cuadrícula de Asientos**
   - Organizada por filas (1, 2, 3...)
   - Columnas (A, B, C, D, E, F)
   - Pasillo visual entre C y D
   - Icono de avión en la parte superior

4. **Acciones**
   - Botón "Cancelar" (volver atrás)
   - Botón "Continuar con la reserva" (ir a pago)

**Lógica de Organización:**

```javascript
// Los asientos se organizan automáticamente por filas
// Ejemplo: "1A", "1B", "1C" | "1D", "1E", "1F"
//          "2A", "2B", "2C" | "2D", "2E", "2F"

const organizedSeats = computed(() => {
  // Agrupa asientos por número de fila
  // Ordena columnas alfabéticamente
  // Retorna estructura: { row: "1", seats: [...] }
})
```

**Estados de Asientos:**

```javascript
// Disponible: Verde, clickeable
.seat.available {
  background: #4caf50;
  cursor: pointer;
}

// Seleccionado: Azul, clickeable para deseleccionar
.seat.selected {
  background: #2196f3;
  transform: scale(1.05);
}

// Ocupado: Gris, no clickeable
.seat.occupied {
  background: #9e9e9e;
  cursor: not-allowed;
  opacity: 0.6;
}
```

**Interacciones:**

```javascript
// Seleccionar/Deseleccionar asiento
const toggleSeat = (seat) => {
  if (!seat.available) return
  
  const index = selectedSeats.value.findIndex(s => s.id === seat.id)
  
  if (index > -1) {
    // Deseleccionar
    selectedSeats.value.splice(index, 1)
  } else {
    // Seleccionar
    selectedSeats.value.push(seat)
  }
}
```

**Transferencia de Datos:**

```javascript
// Al continuar, guarda en sessionStorage
sessionStorage.setItem('reservationData', JSON.stringify({
  flightId: route.params.flightId,
  origin: route.query.origin,
  destination: route.query.destination,
  price: route.query.price,
  departure: route.query.departure,
  selectedSeats: selectedSeats.value
}))
```

## Diseño Visual

### Layout del Avión

```
        ✈️ (Cockpit)
    ─────────────────────
    
    1   A  B  C  |  D  E  F
    2   A  B  C  |  D  E  F
    3   A  B  C  |  D  E  F
    4   A  B  C  |  D  E  F
    ...
```

### Colores del Sistema

- **Verde (#4caf50)**: Asientos disponibles
- **Azul (#2196f3)**: Asientos seleccionados
- **Gris (#9e9e9e)**: Asientos ocupados
- **Rojo (#e60000)**: Botones de acción, header

### Animaciones

- Hover en asientos disponibles: Escala 1.1 + sombra
- Selección: Escala 1.05 + sombra azul
- Transiciones suaves (0.2s) en todos los cambios

## Cómo Probar

### 1. Preparar Datos de Prueba

```bash
cd RetoSenaSoft
php artisan tinker
```

```php
// Crear un avión
$airplane = \App\Models\Airplane::create([
    'model' => 'Boeing 737',
    'capacity' => 180
]);

// Crear asientos para el avión (ejemplo: 6 filas, 6 columnas)
$rows = 6;
$columns = ['A', 'B', 'C', 'D', 'E', 'F'];

foreach (range(1, $rows) as $row) {
    foreach ($columns as $col) {
        \App\Models\Seat::create([
            'code' => $row . $col,
            'class' => in_array($col, ['A', 'F']) ? 'window' : 'aisle',
            'airplane_id' => $airplane->id
        ]);
    }
}

// Crear origen y destino
$origin = \App\Models\Origin::create(['city' => 'BOGOTA']);
$destination = \App\Models\Destination::create(['city' => 'MEDELLIN']);

// Crear vuelo
$flight = \App\Models\Flight::create([
    'departure_at' => '2025-10-25 10:00:00',
    'price' => 250000,
    'origin_id' => $origin->id,
    'destination_id' => $destination->id,
    'airplane_id' => $airplane->id
]);

// Crear flight_seats (asientos disponibles para este vuelo)
$seats = \App\Models\Seat::where('airplane_id', $airplane->id)->get();
foreach ($seats as $seat) {
    \App\Models\flightSeats::create([
        'flight_id' => $flight->id,
        'seat_id' => $seat->id,
        'status' => 'available'
    ]);
}

// Marcar algunos asientos como ocupados (para prueba)
\App\Models\flightSeats::where('flight_id', $flight->id)
    ->whereIn('seat_id', [1, 2, 7, 8]) // Primeros asientos de las filas 1 y 2
    ->update(['status' => 'sold']);
```

### 2. Flujo de Prueba

1. **Iniciar servidores:**
   ```bash
   # Backend
   cd RetoSenaSoft && php artisan serve
   
   # Frontend
   cd FrontendSenaSoft && npm run dev
   ```

2. **Navegar:**
   - Ir a http://localhost:5173
   - Login con credenciales válidas
   - Dashboard → Buscar vuelo BOGOTA → MEDELLIN
   - Hacer clic en "Reservar"

3. **Seleccionar asientos:**
   - Ver cuadrícula de asientos
   - Asientos grises = ocupados (no clickeables)
   - Asientos verdes = disponibles (clickeables)
   - Hacer clic en asientos verdes para seleccionar
   - Asientos seleccionados se vuelven azules
   - Contador en header se actualiza

4. **Continuar:**
   - Hacer clic en "Continuar con la reserva"
   - Redirige a página de pago con datos guardados

## Casos de Prueba

### ✅ Caso 1: Selección Simple
- **Acción**: Seleccionar 1 asiento disponible
- **Resultado**: Asiento se vuelve azul, contador muestra "1 asiento(s)"
- **Botón**: "Continuar" se habilita

### ✅ Caso 2: Selección Múltiple
- **Acción**: Seleccionar 3 asientos disponibles
- **Resultado**: 3 asientos azules, contador muestra "3 asiento(s)"

### ✅ Caso 3: Deselección
- **Acción**: Click en asiento ya seleccionado
- **Resultado**: Asiento vuelve a verde, contador disminuye

### ✅ Caso 4: Asiento Ocupado
- **Acción**: Intentar click en asiento gris
- **Resultado**: No pasa nada, cursor muestra "not-allowed"

### ✅ Caso 5: Sin Selección
- **Acción**: No seleccionar ningún asiento
- **Resultado**: Botón "Continuar" está deshabilitado

### ✅ Caso 6: Responsive
- **Acción**: Abrir en móvil/tablet
- **Resultado**: Cuadrícula se adapta, asientos más pequeños

## Estructura de Datos Transferida

### De Dashboard a SelectSeats (Query Params)
```javascript
{
  origin: "BOGOTA",
  destination: "MEDELLIN",
  price: "250000",
  departure: "2025-10-25 10:00:00"
}
```

### De SelectSeats a Pagar (SessionStorage)
```javascript
{
  flightId: 1,
  origin: "BOGOTA",
  destination: "MEDELLIN",
  price: "250000",
  departure: "2025-10-25 10:00:00",
  selectedSeats: [
    {
      id: 5,
      flightSeatId: 5,
      seatId: 5,
      code: "1A",
      class: "economy",
      available: true,
      status: "available"
    }
  ]
}
```

## Próximas Mejoras

- [ ] Reserva temporal (hold) de asientos por 10 minutos
- [ ] Mostrar precio diferenciado por clase de asiento
- [ ] Filtrar por clase (economy, business, first)
- [ ] Mostrar asientos juntos recomendados
- [ ] Animación de selección de grupo
- [ ] Vista previa 3D del avión
- [ ] Indicador de asientos ventana/pasillo
- [ ] Límite de asientos por reserva

## Archivos Creados/Modificados

1. ✅ [`FrontendSenaSoft/src/views/selectSeats.vue`](./src/views/selectSeats.vue) - Nueva vista de selección
2. ✅ [`FrontendSenaSoft/src/router/routes.js`](./src/router/routes.js) - Ruta agregada
3. ✅ [`FrontendSenaSoft/src/views/dashboard.vue`](./src/views/dashboard.vue) - Botón reservar actualizado

## Solución de Problemas

### No se cargan asientos
- Verificar que existan registros en `flight_seats` para ese vuelo
- Verificar que el endpoint `/flights/{id}/available-seats` funcione
- Revisar console del navegador

### Todos los asientos aparecen ocupados
- Verificar status en `flight_seats` (debe ser 'available')
- Verificar que `hold_expires_at` sea null o futuro

### Error al continuar
- Verificar que sessionStorage esté habilitado
- Verificar que la ruta `/app/pagar` exista

### Diseño roto en móvil
- Verificar media queries en CSS
- Probar en diferentes tamaños de pantalla

## Conclusión

El sistema de selección de asientos está completamente funcional y proporciona una experiencia visual intuitiva similar a sistemas de reserva de aerolíneas reales. Los usuarios pueden ver claramente qué asientos están disponibles, seleccionar los que deseen, y continuar con el proceso de reserva de manera fluida.