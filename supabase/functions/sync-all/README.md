# Supabase Edge Function: Sync All

Esta Edge Function replica la lógica de sincronización de `backend/src/controllers/syncController.js` para ejecutarse directamente en Supabase.

## Características

- ✅ Sincronización completa desde HQ Rentals a Supabase
- ✅ Limpieza de todas las tablas antes de sincronizar
- ✅ Logs detallados en la respuesta
- ✅ Ejecución serverless (sin mantener servidor Node.js)
- ✅ Se puede programar con cron jobs de Supabase

## Variables de Entorno Requeridas

Configura estas variables en tu proyecto de Supabase (Dashboard → Edge Functions → Settings):

```
SUPABASE_URL=https://xtvopaehirznzeyuanwc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
HQ_API_TOKEN=tu_hq_api_token
HQ_API_LOCATIONS_URL=https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/locations
HQ_API_CLASSES_URL=https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/vehicle-classes
HQ_API_RATES_URL=https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/rates
HQ_API_SEASONS_URL=https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/seasons
HQ_API_CHARGES_URL=https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/additional-charges
HQ_API_URL=https://api-america-miami.us4.hqrentals.app/api-america-miami/fleets/vehicles
HQ_API_RESERVATIONS_URL=https://api-america-miami.us4.hqrentals.app/api-america-miami/car-rental/reservations
```

## Despliegue

### Opción 1: Usando Supabase CLI (Recomendado)

1. Instala Supabase CLI:
```bash
npm install -g supabase
```

2. Inicia sesión:
```bash
supabase login
```

3. Conecta a tu proyecto:
```bash
supabase link --project-ref xtvopaehirznzeyuanwc
```

4. Despliega la función:
```bash
supabase functions deploy sync-all
```

### Opción 2: Usando el Dashboard de Supabase

1. Ve a tu dashboard de Supabase
2. Navega a Edge Functions
3. Crea una nueva función llamada `sync-all`
4. Copia el contenido de `index.ts` y pégalo en el editor
5. Configura las variables de entorno
6. Haz clic en "Deploy"

## Uso

### Ejecutar manualmente

```bash
curl -X POST https://xtvopaehirznzeyuanwc.supabase.co/functions/v1/sync-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Programar con Cron Job

En el dashboard de Supabase:
1. Ve a Edge Functions
2. Selecciona `sync-all`
3. Haz clic en "Cron Jobs"
4. Configura la frecuencia (ej: `0 2 * * *` para ejecutar a las 2 AM diariamente)
5. Guarda

## Diferencias con syncController.js

- **syncController.js**: Se mantiene intacto en el backend Node.js
- **Edge Function**: Réplica de la lógica para ejecutarse en Supabase
- **Ambos pueden coexistir**: Puedes usar el backend para sincronizaciones manuales y la Edge Function para sincronizaciones programadas

## Logs

La función devuelve un array de logs detallados en la respuesta:

```json
{
  "success": true,
  "summary": {
    "locations": { "inserted": 4, "updated": 0, "skipped": 0, "errors": [] },
    "categories": { "inserted": 5, "updated": 0, "skipped": 0, "errors": [] },
    // ...
  },
  "logs": [
    { "type": "info", "message": "🚀 INICIANDO SINCRONIZACIÓN TOTAL", "timestamp": "..." },
    { "type": "success", "message": "✅ Tabla locations limpiada", "timestamp": "..." },
    // ...
  ]
}
```

## Seguridad

- Requiere autenticación JWT en el header `Authorization`
- Usa `SUPABASE_SERVICE_ROLE_KEY` para acceso completo a la BD
- Las variables de entorno están protegidas en Supabase
