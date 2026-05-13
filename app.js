// ============================================
// 🔑 CONFIGURACIÓN SUPABASE
// ============================================
const SUPABASE_URL = 'https://xtvopaehirznzeyuanwc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LCKuoYEaj6uJ4SOTUkHKwA_CYXZYOjf'; // ← reemplaza con tu anon eyJ... key

letsb_publishablexxxxxxxxxxxxxxxxxxxxxx';

let sbClient = null;
let allData = [];

// ============================================
// 📅 UTILIDADES DE FECHA
// ============================================
function fmtTime(ts) {
  return new Date(ts).toISOString().substring(11, 16);
}

function fmtDate(ts) {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

// ============================================
// 🎨 MANEJO DE TEMAS (ahora sí cambia colores reales)
// ============================================
function setTheme(name) {
  const root = document.documentElement;
  if (name === 'cyber') {
    root.setAttribute('data-theme', 'cyber');
    root.style.setProperty('--accent-cyan', '#06b6d4');
    root.style.setProperty('--accent-purple', '#8b5cf6');
    root.style.setProperty('--accent-green', '#10b981');
    root.style.setProperty('--accent-orange', '#f97316');
    root.style.setProperty('--accent-pink', '#ec4899');
  } else if (name === 'matrix') {
    root.setAttribute('data-theme', 'matrix');
    root.style.setProperty('--accent-cyan', '#00ff41');
    root.style.setProperty('--accent-purple', '#00cc33');
    root.style.setProperty('--accent-green', '#00ff41');
    root.style.setProperty('--accent-orange', '#33ff00');
    root.style.setProperty('--accent-pink', '#00ff66');
    // Ajustes Matrix
    root.style.setProperty('--bg-primary', '#0a1a0a');
    root.style.setProperty('--bg-card', '#0f2a0f');
    root.style.setProperty('--text-primary', '#ccffcc');
  } else if (name === 'sunset') {
    root.setAttribute('data-theme', 'sunset');
    root.style.setProperty('--accent-cyan', '#ff9a3c');
    root.style.setProperty('--accent-purple', '#ff5e7c');
    root.style.setProperty('--accent-green', '#ffb347');
    root.style.setProperty('--accent-orange', '#ff6b35');
    root.style.setProperty('--accent-pink', '#ff8c69');
    // Ajustes Sunset
    root.style.setProperty('--bg-primary', '#1e1a1f');
    root.style.setProperty('--bg-card', '#2d242b');
    root.style.setProperty('--text-primary', '#ffe6e6');
  }
}

// ============================================
// 🔌 ESTADO DE CONEXIÓN
// ============================================
function updateStatus(status) {
  const dot = document.querySelector('.status-dot');
  const text = document.getElementById('connectionStatus');
  if (!dot || !text) return;
  const states = {
    connected: { bg: 'var(--accent-green)', label: '● Conectado' },
    error: { bg: 'var(--accent-red)', label: '✗ Error' },
    loading: { bg: 'var(--accent-yellow)', label: '⏳ Actualizando...' },
  };
  const s = states[status] || states.loading;
  dot.style.background = s.bg;
  text.textContent = s.label;
}

function updateLastUpdate() {
  const el = document.getElementById('lastUpdate');
  if (el) {
    el.textContent = new Date().toLocaleString('es-ES', { hour12: false });
  }
}

function showError(msg) {
  console.error('❌', msg);
  const box = document.getElementById('errorBox');
  if (box) {
    box.textContent = '❌ ' + msg;
    box.classList.add('active');
    setTimeout(() => box.classList.remove('active'), 5000);
  }
  updateStatus('error');
}

// ============================================
// 📡 CARGA DE DATOS DESDE SUPABASE
// ============================================
async function fetchData() {
  try {
    updateStatus('loading');
    const { data, error } = await sbClient
      .from('reportes_hq')
      .select('*')
      .order('hora_reporte', { ascending: false })
      .limit(200);

    if (error) throw error;
    if (!data || data.length === 0)
      throw new Error('La tabla reportes_hq está vacía o sin permisos');

    allData = data;
    updateUI(data);
    updateStatus('connected');
    updateLastUpdate();
    return true;
  } catch (err) {
    showError('Error cargando datos: ' + err.message);
    return false;
  }
}

// ============================================
// 🖥️ ACTUALIZA LAS TARJETAS ESTÁTICAS
// ============================================
function getLatestByLocation(data) {
  const map = {};
  data.forEach(row => {
    if (!map[row.location] || new Date(row.hora_reporte) > new Date(map[row.location].hora_reporte)) {
      map[row.location] = row;
    }
  });
  return Object.values(map);
}

function updateStaticCards(data) {
  const latest = getLatestByLocation(data);

  latest.forEach(loc => {
    let cardId = '';
    if (loc.location === 'Nashville') cardId = 'card-nashville';
    else if (loc.location === 'Miami') cardId = 'card-miami';
    else if (loc.location === 'Charlotte') cardId = 'card-orlando';
    else return;

    const card = document.getElementById(cardId);
    if (!card) return;

    // 1. Total reservas (suma de todos los estados)
    const totalRes = (loc.on_rent || 0) + (loc.open || 0) + (loc.no_show || 0) +
                     (loc.unqualified || 0) + (loc.cancellations || 0) + (loc.turo || 0);
    const totalSpan = card.querySelector('.total-reservations .number');
    if (totalSpan) totalSpan.textContent = totalRes;

    // 2. Métricas individuales (On Rent, Unqualified, Cancellations, No Show, Open, Turo)
    const metrics = {
      'ON RENT': loc.on_rent,
      'UNQUALIFIED': loc.unqualified,
      'CANCELLATIONS': loc.cancellations,
      'NO SHOW': loc.no_show,
      'OPEN': loc.open,
      'TURO': loc.turo
    };
    for (const [label, value] of Object.entries(metrics)) {
      const metricDiv = Array.from(card.querySelectorAll('.metric-item')).find(
        item => item.querySelector('.metric-label')?.innerText === label
      );
      if (metricDiv) {
        const valSpan = metricDiv.querySelector('.metric-value');
        if (valSpan) valSpan.textContent = value;
      }
    }

    // 3. Returns (progreso)
    if (loc.returns && loc.return_completed !== undefined) {
      const returnsSpan = card.querySelector('.returns-value');
      if (returnsSpan) returnsSpan.textContent = `${loc.return_completed} / ${loc.returns}`;
      const fillBar = card.querySelector('.progress-bar-fill');
      if (fillBar && loc.returns > 0) {
        const percent = (loc.return_completed / loc.returns) * 100;
        fillBar.style.width = `${percent}%`;
      }
    }

    // 4. Tomorrow (open mañana / return mañana)
    const tomorrowItems = card.querySelectorAll('.tomorrow-section .tomorrow-item');
    if (tomorrowItems.length >= 2) {
      const openTomorrow = tomorrowItems[0].querySelector('.tomorrow-value');
      if (openTomorrow && loc.reservas_next_day !== undefined)
        openTomorrow.textContent = loc.reservas_next_day;
      const returnTomorrow = tomorrowItems[1].querySelector('.tomorrow-value');
      if (returnTomorrow && loc.return_next_day !== undefined)
        returnTomorrow.textContent = loc.return_next_day;
    }

    // 5. Footer: Rental Days, Avg Rate/Day, Vehicles Avail
    const footerStats = card.querySelectorAll('.card-footer .footer-stat');
    if (footerStats.length >= 3) {
      const rentalDaysSpan = footerStats[0].querySelector('.footer-value');
      if (rentalDaysSpan && loc.total_rental_days !== undefined)
        rentalDaysSpan.textContent = loc.total_rental_days;
      const avgRateSpan = footerStats[1].querySelector('.footer-value');
      if (avgRateSpan && loc.avg_rate_day !== undefined)
        avgRateSpan.textContent = `$${loc.avg_rate_day.toFixed(2)}`;
      const availSpan = footerStats[2].querySelector('.footer-value');
      if (availSpan && loc.vehicles_available !== undefined)
        availSpan.textContent = loc.vehicles_available;
    }
  });
}

function updateUI(data) {
  updateStaticCards(data);
  // No hay KPIs ni gráfico en esta versión, pero puedes agregarlos después si quieres
}

// ============================================
// 🔄 SINCRONIZACIÓN FORZADA (con bot de Telegram)
// ============================================
async function forceSync() {
  const btn = document.getElementById('forceSyncBtn');
  const text = document.getElementById('syncText');
  if (!btn || !text) return;
  const icon = btn.querySelector('.sync-icon');

  btn.disabled = true;
  text.innerText = "Sincronizando...";
  if (icon) icon.classList.add('spin');

  try {
    const { data, error } = await sbClient
      .from('comandos_bot')
      .insert([{ comando: 'sync_now', status: 'pending' }])
      .select()
      .single();

    if (error) throw error;

    const comandoId = data.id;

    const channel = sbClient
      .channel('comando_status_' + comandoId)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'comandos_bot', filter: `id=eq.${comandoId}` },
        (payload) => {
          const status = payload.new.status;
          if (status === 'processing') {
            text.innerText = "Bot procesando...";
          }
          if (status === 'completed') {
            text.innerText = "¡Completado!";
            if (icon) icon.classList.remove('spin');
            setTimeout(() => {
              fetchData();
              text.innerText = "Sincronizar";
              btn.disabled = false;
            }, 2000);
            sbClient.removeChannel(channel);
          }
          if (status === 'error') {
            text.innerText = "Error";
            if (icon) icon.classList.remove('spin');
            btn.disabled = false;
            showError("Error en el procesamiento del comando");
            sbClient.removeChannel(channel);
          }
        }
      )
      .subscribe();

  } catch (err) {
    console.error("Error en sincronización:", err);
    btn.disabled = false;
    text.innerText = "Sincronizar";
    if (icon) icon.classList.remove('spin');
    showError("Error: " + (err.message || "No se pudo conectar al bot"));
  }
}

// ============================================
// 🚀 INICIALIZACIÓN
// ============================================
async function init() {
  if (typeof window.supabase === 'undefined') {
    setTimeout(init, 300);
    return;
  }
  try {
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    await fetchData();
    setInterval(fetchData, 30000); // refresh cada 30 segundos
  } catch (err) {
    showError('Error inicializando: ' + err.message);
  }
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}