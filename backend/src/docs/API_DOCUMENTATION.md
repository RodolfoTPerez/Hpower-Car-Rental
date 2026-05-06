# Documentación Detallada de la API - Horsepower Backend

Esta documentación proporciona detalles técnicos sobre los endpoints disponibles en el servidor de Horsepower Car Rental.

## 🔑 Autenticación (Auth)

### `POST /api/register`
Registro de nuevos usuarios en el sistema.
-   **Validaciones (Express-Validator):**
    -   `email`: Debe ser un correo electrónico válido.
    -   `password`: Mínimo 6 caracteres.
-   **Respuesta Exitosa:** `201 Created` con el token de sesión inicial.

### `POST /api/login`
Autenticación de usuarios existentes utilizando Bcrypt para la comparación de hashes.
-   **Lógica:** Delegada al `authController.login`.
-   **Respuesta Exitosa:** `200 OK` con datos del usuario y JWT.

## 🚗 Gestión de Flota (Fleet)

### `GET /api/fleet-stats`
Obtiene estadísticas en tiempo real de los vehículos disponibles para el Dashboard.
-   **Query Params:**
    -   `location_id` (opcional): Filtra los vehículos por ID de sucursal.
-   **Lógica de Clasificación:**
    -   **Sedanes:** Incluye categorías como ICAR, FCAR, Midsize y Fullsize.
    -   **SUVs:** Incluye todas las categorías que contienen "SUV".
    -   **Vans:** Incluye Minivans, Shuttles y vehículos de 7 pasajeros.
-   **Respuesta:**
    ```json
    {
      "success": true,
      "stats": {
        "total": 25,
        "sedan": 10,
        "suv": 8,
        "van": 7
      }
    }
    ```

## 🌐 Integración HQ Rentals (Externo)

### `USE /api/hq`
Ruta base que agrupa todas las interacciones con el motor de reserva externo HQ Rentals.

| Endpoint | Descripción |
| :--- | :--- |
| `GET /api/hq/locations` | Listado de sucursales activas en HQ. |
| `GET /api/hq/seasons` | Períodos de temporada (baja, alta, especial). |
| `GET /api/hq/charges` | Cargos adicionales asociados a la ubicación. |
| `GET /api/hq/vehicles` | Listado detallado de la flota desde HQ. |

## 🛠️ Configuración de Base de Datos

El backend utiliza **Supabase** como sistema de almacenamiento principal:
-   **Tablas:** `vehicles`, `vehicle_categories`, `locations`.
-   **Configuración:** Gestionada en `src/config/supabase.js`.

## ⚠️ Manejo de Errores

El servidor implementa un manejador global para errores 404 (Recurso no encontrado) y captura errores internos 500 en endpoints críticos como `/api/fleet-stats` para evitar caídas del servicio.
