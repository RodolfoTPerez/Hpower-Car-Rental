import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/vehicles', icon: '🚗', label: 'Vehículos' },
    { path: '/admin/reservations', icon: '📋', label: 'Reservaciones' },
    { path: '/admin/prices', icon: '💰', label: 'Importar Precios' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '70px' : '240px',
        transition: 'width 0.3s',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🚘</span>
            {!collapsed && (
              <span style={{ color: 'var(--text-primary)', fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '2px' }}>
                HPOWER ADMIN
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                color: location.pathname === item.path ? 'var(--accent-primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                background: location.pathname === item.path ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderLeft: location.pathname === item.path ? '3px solid var(--accent-primary)' : '3px solid transparent',
                transition: 'all 0.2s',
                fontSize: '14px',
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          ))}
        </nav>

        {/* User & Logout */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {!collapsed && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px' }}>
              {user?.name || user?.email}
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(255,59,48,0.15)',
              border: '1px solid rgba(255,59,48,0.3)',
              borderRadius: '8px',
              color: '#ff3b30',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {collapsed ? '🚪' : '🚪 Salir'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;