import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '24px',
    flex: 1,
    minWidth: '200px',
  }}>
    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>{label}</div>
    <div style={{ color: color || 'var(--accent-primary)', fontSize: '28px', fontFamily: 'Bebas Neue', letterSpacing: '1px' }}>{value}</div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    totalReservations: 0,
    pendingReservations: 0,
    totalRevenue: 0,
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [vehiclesRes, reservationsRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/reservations'),
      ]);

      const vehicles = vehiclesRes.data.data || [];
      const reservations = reservationsRes.data.data || [];

      const totalRevenue = reservations
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + parseFloat(r.total_price || 0), 0);

      setStats({
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter(v => v.status === 'available').length,
        totalReservations: reservations.length,
        pendingReservations: reservations.filter(r => r.status === 'pending').length,
        totalRevenue,
      });

      setRecentReservations(reservations.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    pending: '#f5a623',
    confirmed: '#4cd964',
    completed: '#007aff',
    cancelled: '#ff3b30',
  };

  return (
    <AdminLayout>
      <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '32px', color: 'var(--text-primary)', letterSpacing: '2px', marginBottom: '30px' }}>
        DASHBOARD
      </h1>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Cargando estadísticas...</div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <StatCard icon="🚗" label="Total Vehículos" value={stats.totalVehicles} />
            <StatCard icon="✅" label="Disponibles" value={stats.availableVehicles} color="#4cd964" />
            <StatCard icon="📋" label="Reservaciones" value={stats.totalReservations} />
            <StatCard icon="⏳" label="Pendientes" value={stats.pendingReservations} color="#f5a623" />
            <StatCard icon="💰" label="Ingresos" value={`$${stats.totalRevenue.toFixed(2)}`} color="#4cd964" />
          </div>

          {/* Recent Reservations */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '20px' }}>
              Reservaciones Recientes
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {['Código', 'Cliente', 'Vehículo', 'Fechas', 'Total', 'Estado'].map(h => (
                    <th key={h} style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '8px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentReservations.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ color: 'var(--text-primary)', padding: '12px 8px', fontSize: '13px' }}>{r.reservation_code}</td>
                    <td style={{ color: 'var(--text-secondary)', padding: '12px 8px', fontSize: '13px' }}>{r.customer_name || r.user_id}</td>
                    <td style={{ color: 'var(--text-secondary)', padding: '12px 8px', fontSize: '13px' }}>{r.vehicle_id}</td>
                    <td style={{ color: 'var(--text-secondary)', padding: '12px 8px', fontSize: '13px' }}>{r.start_date?.slice(0,10)} → {r.end_date?.slice(0,10)}</td>
                    <td style={{ color: 'var(--accent-primary)', padding: '12px 8px', fontSize: '13px' }}>${r.total_price}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        background: `${statusColor[r.status]}22`,
                        color: statusColor[r.status],
                        border: `1px solid ${statusColor[r.status]}44`,
                        borderRadius: '20px',
                        padding: '3px 10px',
                        fontSize: '11px',
                      }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard;