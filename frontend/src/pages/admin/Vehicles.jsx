import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Importamos el hook
import AdminLayout from './AdminLayout';
import api from '../../services/api';

const glassCard = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px',
  padding: '24px',
};

const btnPrimary = {
  background: '#00b894',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
};

const btnDanger = {
  background: 'rgba(255,59,48,0.15)',
  color: '#ff3b30',
  border: '1px solid rgba(255,59,48,0.3)',
  borderRadius: '8px',
  padding: '6px 14px',
  cursor: 'pointer',
  fontSize: '13px',
};

const btnSecondary = {
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '8px',
  padding: '6px 14px',
  cursor: 'pointer',
  fontSize: '13px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const VehicleModal = ({ vehicle, categories, onClose, onSave }) => {
  const { t } = useTranslation(); // Inicializamos t
  const [form, setForm] = useState(vehicle ? {
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year || new Date().getFullYear(),
    license_plate: vehicle.license_plate || '',
    color: vehicle.color || '',
    mileage: vehicle.mileage || 0,
    category_id: vehicle.category_id || '',
    status: vehicle.status || 'available', // Normalizado a minúscula
    notes: vehicle.notes || '',
    base_price_per_day: vehicle.base_price_per_day || 0,
  } : {
    brand: '', model: '', year: new Date().getFullYear(),
    license_plate: '', color: '', mileage: 0,
    category_id: '', status: 'available', notes: '',
    base_price_per_day: 0,
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      if (vehicle?.id) {
        await api.put(`/vehicles/${vehicle.id}`, form);
      } else {
        await api.post('/vehicles', form);
      }
      onSave();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert('Error: ' + msg);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ ...glassCard, width: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ color: '#fff', marginBottom: '24px', fontFamily: 'Bebas Neue', fontSize: '24px' }}>
          {vehicle?.id ? 'EDITAR VEHÍCULO' : 'NUEVO VEHÍCULO'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Marca', name: 'brand' },
            { label: 'Modelo', name: 'model' },
            { label: 'Año', name: 'year', type: 'number' },
            { label: 'Placa', name: 'license_plate' },
            { label: 'Color', name: 'color' },
            { label: 'Kilometraje', name: 'mileage', type: 'number' },
            { label: 'Tarifa diaria ($)', name: 'base_price_per_day', type: 'number' },
          ].map(field => (
            <div key={field.name}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                {field.label}
              </label>
              <input
                name={field.name}
                type={field.type || 'text'}
                value={form[field.name] || ''}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          ))}

          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              {t('vehicles.filter_by_category')}
            </label>
            <select name="category_id" value={form.category_id || ''} onChange={handleChange} style={{ ...inputStyle, background: '#1a1a2e' }}>
              <option value="">{t('vehicles.all_categories')}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Estado
            </label>
            <select name="status" value={form.status} onChange={handleChange} style={{ ...inputStyle, background: '#1a1a2e' }}>
              <option value="available">{t('vehicles.status.available')}</option>
              <option value="rented">{t('vehicles.status.rented')}</option>
              <option value="maintenance">{t('vehicles.status.maintenance')}</option>
              <option value="inactive">{t('vehicles.status.inactive')}</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
            Notas
          </label>
          <textarea
            name="notes"
            value={form.notes || ''}
            onChange={handleChange}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSecondary}>Cancelar</button>
          <button onClick={handleSubmit} style={btnPrimary}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

const Vehicles = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, cRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/categories'),
      ]);
      setVehicles(vRes.data.data || []);
      setCategories(cRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este vehículo?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchData();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleNew = () => {
    setSelectedVehicle(null);
    setShowModal(true);
  };

  // Colores mapeados a minúsculas (viniendo de la API: available, rented, etc.)
  const statusColor = {
    available: '#4cd964',
    rented: '#007aff',
    maintenance: '#f5a623',
    inactive: '#ff3b30',
  };

  const filtered = vehicles.filter(v =>
    `${v.brand} ${v.model} ${v.license_plate}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '32px', color: '#fff', letterSpacing: '2px', margin: 0 }}>
          VEHÍCULOS
        </h1>
        <button onClick={handleNew} style={btnPrimary}>+ Nuevo Vehículo</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          placeholder="Buscar por marca, modelo o placa..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '400px' }}
        />
      </div>

      <div style={glassCard}>
        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.6)' }}>Cargando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '40px' }}>
            {t('vehicles.no_vehicles')}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Vehículo', 'Placa', 'Año', 'Color', 'Categoría', 'Tarifa/día', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', padding: '8px', textAlign: 'left', fontWeight: '500' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ color: '#fff', padding: '12px 8px', fontSize: '14px', fontWeight: '500' }}>
                    {v.brand} {v.model}
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.6)', padding: '12px 8px', fontSize: '13px' }}>{v.license_plate}</td>
                  <td style={{ color: 'rgba(255,255,255,0.6)', padding: '12px 8px', fontSize: '13px' }}>{v.year}</td>
                  <td style={{ color: 'rgba(255,255,255,0.6)', padding: '12px 8px', fontSize: '13px' }}>{v.color || '-'}</td>
                  <td style={{ color: 'rgba(255,255,255,0.6)', padding: '12px 8px', fontSize: '13px' }}>
                    {categories.find(c => c.id === v.category_id)?.name || '-'}
                  </td>
                  <td style={{ color: '#00b894', padding: '12px 8px', fontSize: '13px', fontWeight: '600' }}>
                    ${v.base_price_per_day}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      background: `${statusColor[v.status]}22`,
                      color: statusColor[v.status] || '#fff',
                      border: `1px solid ${statusColor[v.status]}44`,
                      borderRadius: '20px',
                      padding: '3px 10px',
                      fontSize: '11px',
                    }}>
                      {/* Traducción dinámica basada en el valor que viene de la base de datos */}
                      {t(`vehicles.status.${v.status}`)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(v)} style={btnSecondary}>✏️</button>
                      <button onClick={() => handleDelete(v.id)} style={btnDanger}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <VehicleModal
          vehicle={selectedVehicle}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={fetchData}
        />
      )}
    </AdminLayout>
  );
};

export default Vehicles;