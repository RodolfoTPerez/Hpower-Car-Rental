import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './i18n/index.js'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Fleet from './pages/Fleet'
import Login from './pages/Login'
import Register from './pages/Register'
import MyAccount from './pages/MyAccount'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Cargando...</div>
  return user ? children : <Navigate to="/login" />
}

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/fleet"    element={<Fleet />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account"  element={
          <PrivateRoute><MyAccount /></PrivateRoute>
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