# Documentación: Integración Dinámica de la Flota (Hpower Car Rental)

Este documento resume todos los cambios y adiciones realizados en el proyecto web para migrar de una página de flota estática a una interfaz 100% interactiva conectada a **Supabase** y **HQ Rentals**.

## Arquitectura General del Sistema

El proyecto Hpower Car Rental ahora consiste en:

- **Frontend estático**: Múltiples páginas HTML con CSS y JavaScript inline
- **Backend API**: Servidor Express.js en `backend/` (localhost:3000)
- **Base de datos**: Supabase PostgreSQL
- **Sistema de reservas**: HQ Rentals (integración vía iframe)
- **Panel administrativo**: Dashboard completo para gestión y sincronización

### Archivos HTML Principales
- `index.html` - Landing page con formulario de reservas y contadores en vivo
- `fleet.html` - Catálogo de flota dinámico desde Supabase
- `booking.html` - Iframe de HQ Rentals para reservas
- `contact.html` - Información de contacto y sucursales
- `login.html` - Autenticación administrativa
- `admin-panel.html` - Dashboard administrativo con sincronización
- `terms.html` - Términos y condiciones

## 1. Módulo del Cliente Supabase (`js/supabase-client.js`)
Se creó un nuevo módulo en JavaScript responsable de comunicarse con la base de datos de manera directa (vía REST).
*   **Llave Pública:** Se configuró el `anon_key` (Publishable Key) de Supabase para admitir consultas sin servidor intermedio (`sb_publishable_LCKuoYEaj6uJ4SOTUkHKwA_CYXZYOjf`).
*   **Funciones Principales:**
    *   `getVehiclesByLocation(locationId)`: Extrae todos los vehículos disponibles agrupados por categoría. Se programó una **lógica avanzada de agrupación** que identifica si se selecciona "Todas las Ubicaciones", forzando a que [Categoría + Ubicación] se consideren entidades separadas, para que el usuario no mezcle un "SUV en Miami" con un "SUV en Charlotte".
    *   `getFleetStats(locationId)`: Obtiene los contadores reales para mostrar en los banners numéricos.
*   **Manejo de Precios:** El módulo consulta en tiempo real en la tabla `vehicle_rates` las fechas actuales y aplica automáticamente el `base_price_per_day` si no ubica una tarifa de temporada.

## 2. Renovación de Flota (`fleet.html`)
Se eliminaron las casi 400 líneas de código estático HTML que simulaban los vehículos.
*   **Renderizado por Componente:** Se añadió la función `renderFleetCard(cat, idx, locationKey)`, que inyecta código HTML de manera dinámica desde los datos JSON arrojados por Supabase.
*   **Insignias de Locación (Badge):** Cuando un usuario está parado en `Todas`, se inyecta visualmente en la tarjeta un pin descriptivo del carro (ej. `📍 Miami`).
*   **Banners de Estadísticas:** El banner superior "1200+ Vehículos", etc. dejó de ser estático y ahora inyecta los `count` de `stats-total`, `stats-suv`, `stats-sedan`, etc., basados en la ciudad seleccionada.
*   **Sistema de Filtros:** Se acopló el menú de ciudades en la barra izquierda (`Miami`, `Charlotte`, `Nashville`) con los `locationId` exactos mapeados de Supabase (`1`, `5`, `6`).

## 3. Renovación de Inicio (`index.html`)
Se intervinieron los contadores animados del "Hero Section" de la página de inicio.
*   Ahora extrae de Supabase la cantidad exacta de vehículos de Miami, Nashville y Charlotte.
*   Se añadieron los scripts necesarios para la carga asíncrona previo a la inicialización de la página.

## 4. Script de Sincronización Independiente (`sync-hq.js`)
Conscientes de que mantener Supabase hidratado es imperativo, se creó un script en Node.js que no depende del Dashboard para operar.
*   **Funcionamiento:** Emula la API interna usando el token de **HQ Rentals**. Pide todos los catálogos y los empuja a Supabase.
*   **Seguridad y Variables de Entorno:** Las credenciales (Tokens de Supabase y HQ) ya no están escritas en texto plano (harcodeadas). Ahora se leen en tiempo de ejecución desde el archivo seguro `backend/.env`.
*   **Tablas que sincroniza:** `locations`, `vehicle_categories`, `vehicles`, `seasons`, `vehicle_rates`, `charges`.
*   **Comandos Soporte:** Ejecutando `node sync-hq.js all` se sincronizan todas, pero permite particiones para no gastar cuota (Ej. `node sync-hq.js vehicles`).
*   **Automatización (Cron):** El archivo puede adjuntarse al Programador de Tareas de Windows, PM2, u otra herramienta Cron para sincronizaciones periódicas sin requerir intervención humana.

## 5. Notas Importantes sobre Entornos Locales
*   **Caché del Servidor Local:** Se diagnosticó que correr `npx http-server` activa un bloqueo de memoria (caching) de 3600 segundos (1 hora). Para desarrollo con este proyecto, **siempre** usar el comando `npx http-server -p 8081 -c-1` (obligando a ignorar el caché).
*   **Políticas de Seguridad de Nivel de Fila (RLS) en Supabase:** Se comprobó que el flujo directo de lectura del Navegador requiere que el "RLS" (Row Level Security) esté configurado para permitir `SELECT` público a los usuarios `anon`, o directamente apagado (para `vehicles`, `locations`, `vehicle_categories`, y `vehicle_rates`).

## 6. Backend Express.js (localhost:3000)

Se implementó un servidor backend en Node.js/Express para:
- **Autenticación administrativa**: Endpoint `/api/v1/auth/login` con JWT
- **Gestión de flota**: Rutas para vehículos, categorías, tarifas
- **Sincronización HQ**: Endpoints para sync de HQ Rentals
- **Dashboard API**: Datos para el panel administrativo

### Estructura del Backend
```
backend/
├── src/
│   ├── server.js           # Entry point
│   ├── routes/             # Definición de rutas
│   ├── controllers/        # Lógica de negocio
│   └── middlewares/        # Middleware (auth, validación)
└── package.json
```

### Dependencias del Backend
- `@supabase/supabase-js` - Cliente Supabase
- `express` - Framework web
- `jsonwebtoken` - Tokens JWT
- `bcryptjs` - Hashing de contraseñas
- `cors` - CORS
- `dotenv` - Variables de entorno

## 7. Panel Administrativo (admin-panel.html)

Se creó un dashboard completo para gestión administrativa con:
- **Dashboard operativo**: Estadísticas de flota, ingresos, ocupación
- **Módulos de sincronización**: Sync individual o completo con HQ Rentals
- **Gestión de ubicaciones**: Tabla de ubicaciones con estados
- **Visualizador de reservas HQ**: Reservas sincronizadas desde HQ Rentals
- **Integración Supabase**: Consultas directas a la base de datos
- **Integración Backend**: Llamadas a API local para operaciones administrativas

### Características del Dashboard
- Diseño glassmorphism con tema oscuro
- Navegación por secciones (Dashboard, Sync, Locations, HQ Reservations)
- Filtros por fechas para reportes
- Consola de sync en tiempo real
- Estadísticas agregadas por ubicación

## 8. Mejoras al Panel Administrativo (Abril 2026)

### 8.1 Sección de Flota/Vehículos
Se agregó un nuevo módulo de estadísticas de flota por categoría:
- **Estadísticas mostradas:**
  - Categoría más rentada (con conteo)
  - Categoría menos rentada (con conteo)
  - Total de reservas
  - Categorías activas
- **Tabla de reservas por categoría:**
  - Nombre de categoría (usando mapeo de `hq_class_ids` JSON)
  - Cat ID
  - Cantidad de reservas
  - Porcentaje del total (con barra visual)
  - Tendencia
- **Filtros:**
  - Modo "General": estadísticas de todas las ubicaciones
  - Modo "Por Ubicación": selector para filtrar por Miami/Charlotte/Nashville
- **Mapeo de categorías:**
  - Usa el campo `hq_class_ids` (JSON array) en `vehicle_categories`
  - Mapea `vehicle_class_id` de `reservations_open` a nombres de categorías
  - Ejemplo: vehicle_class_id 31 → "Midsize SUV - IFAR"

### 8.2 Mejoras en Reservas HQ (Open)
- **Filtro por Brand ID:**
  - Cambiado de filtro por Cat ID a filtro por Brand ID
  - Dropdown con opciones: Todos, Miami (1), Charlotte (2), Nashville (3)
  - Filtra por campo `brand_id` en las reservas
- **Tarjetas de estadísticas:**
  - Total Reservas Pendientes (conteo total de reservas Open)
  - Reservas Filtradas (conteo después de aplicar filtros)
  - Ingresos Totales (suma de precios de reservas filtradas)
- **Estilos:**
  - Dropdown respetando tema oscuro con variables CSS

### 8.3 Mejoras Visuales del Dashboard
- **Efecto Glassmorphism en tarjetas:**
  - Fondo con color primario semitransparente `rgba(78, 204, 163, 0.15)`
  - Borde con color primario semitransparente
  - Blur de fondo (`backdrop-filter: blur(15px)`)
  - Sombra con tono primario
  - Hover con intensificación del efecto
- **Temporizador de expiración de token:**
  - Indicador de tiempo restante de la sesión
  - Colores dinámicos según tiempo restante (verde/amarillo/rojo)
  - Ubicado en la tarjeta de filtros del dashboard
- **Ajustes en tarjetas de estadísticas:**
  - Reducción de tamaño de fuente de números
  - Centrado de contenido en tarjetas
  - Eliminación de palabra "mantenimiento" en tasa de ocupación

### 8.4 Restauración de Funcionalidades
- **Selectores de fecha en módulo de sync:**
  - Restaurados los inputs de fecha para filtrar sincronización
  - Lógica de filtrado por rango de fechas en `runSync()`
- **Corrección de carga de Supabase client:**
  - Eliminado `type="module"` para permitir carga desde `file://`
  - Resolución de errores CORS

### 8.5 Detalles Técnicos
- **Endpoint usado para flota:** `/api/v1/reservations/hq/active` (backend API)
- **Endpoint usado para HQ Reservations:** `/api/v1/reservations/hq/active` (backend API)
- **Mapeo de ubicaciones:** 1=Miami, 2=Charlotte, 3=Nashville
- **Consulta de categorías:** `vehicle_categories` con campo `hq_class_ids` (JSON)

## 9. Sistema de Analytics (Abril 2026)

### 9.1 Tabla de Analytics en Supabase
Se creó la tabla `analytics_visits` para tracking de visitas al sitio web:
- **Campos:**
  - `ip_address` - Dirección IP del visitante
  - `user_agent` - Navegador y dispositivo
  - `referrer` - Página de origen
  - `page_url` - URL visitada
  - `page_title` - Título de la página
  - `screen_resolution` - Resolución de pantalla
  - `language` - Idioma del navegador
  - `country` - País (obtenido de IP)
  - `city` - Ciudad (obtenido de IP)
  - `session_start` - Timestamp de inicio de sesión
  - `session_end` - Timestamp de fin de sesión
  - `duration_seconds` - Duración de la sesión
- **Políticas RLS:**
  - INSERT permitido para usuarios anon y authenticated
  - SELECT permitido solo para usuarios authenticated (admin)

### 9.2 Backend API de Analytics
Se creó el controller `analytics.controller.js` con los siguientes endpoints:
- `POST /api/v1/analytics/track` - Registrar nueva visita
- `PUT /api/v1/analytics/session` - Actualizar duración de sesión
- `GET /api/v1/analytics` - Obtener datos de analytics con filtros
- `GET /api/v1/analytics/summary` - Obtener resumen agregado (visitas, países, páginas)

### 9.3 Script de Tracking Frontend
Se creó `js/analytics.js` que:
- Captura datos del visitante (user agent, referrer, resolución, idioma)
- Envía visita al backend al cargar la página
- Actualiza duración de sesión cada 30 segundos
- Usa `navigator.sendBeacon` para envío confiable al cerrar página
- Se integra en `index.html` mediante script tag

### 9.4 Vista de Analytics en Admin Panel
Se agregó sección "Analytics" en `admin-panel.html`:
- **Tarjetas de estadísticas:**
  - Total Visitas
  - Visitantes Únicos (por IP)
  - Duración Promedio de sesión
  - Cantidad de Países
- **Tablas:**
  - Visitas por País (con porcentaje y barra visual)
  - Visitas por Página (con porcentaje y barra visual)
- **Filtros:**
  - Selector de rango de fechas
  - Botón de actualización

## 10. Problemas Conocidos y Recomendaciones

### Code Duplication
- Los módulos `js/i18n.js`, `js/carousel.js`, y `js/booking.js` existen pero no se utilizan
- La lógica está duplicada inline en cada archivo HTML
- **Recomendación**: Refactorizar para usar los módulos JS compartidos

### Inconsistencias de Carga
- `login.html` carga Supabase SDK CDN además de `js/supabase-client.js` (redundante)
- `admin-panel.html` carga `js/supabase-client.js` como ES module mientras otros lo cargan como script regular
- **Recomendación**: Estandarizar la carga de scripts

### CSS Inline
- Todo el CSS está inline en los archivos HTML
- No existe archivo `css/styles.css` como se menciona en documentación antigua
- **Recomendación**: Considerar extracción a archivos CSS separados para mantenimiento

---
*(Generado por el Asistente IA para el equipo de desarrollo de Hpower)*
*(Última actualización: 23 de Abril 2026)*
