import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './i18n/index.js'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Fleet from './pages/Fleet'
import Login from './pages/Login'
import Register from './pages/Register'
import MyAccount from './pages/MyAccount'
import About from './pages/About'
import Contact from './pages/Contact'
import Dashboard from './pages/admin/Dashboard'
import Vehicles from './pages/admin/Vehicles'

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Cargando...</div>
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role?.toLowerCase())) return <Navigate to="/" />
  return children
}

const AppRoutes = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={
          <PrivateRoute><MyAccount /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute roles={['admin', 'agent']}><Dashboard /></PrivateRoute>
        } />
        <Route path="/admin/vehicles" element={
          <PrivateRoute roles={['admin', 'agent']}><Vehicles /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <div style={{
            minHeight: '100vh',
            background: 'var(--bg-gradient)',
            transition: 'all 0.3s ease'
          }}>
            <AppRoutes />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
