import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  es: {
    translation: {
      nav: {
        home: "Inicio",
        fleet: "Flota",
        login: "Iniciar Sesión",
        logout: "Cerrar Sesión",
        profile: "Mi Perfil",
        admin: "Panel Admin"
      },
      home: {
        hero_title: "CONDUCE TU AVENTURA",
        hero_subtitle: "Los mejores vehículos al mejor precio",
        search_title: "Busca tu vehículo ideal",
        pickup_date: "Fecha de recogida",
        return_date: "Fecha de devolución",
        pickup_location: "Lugar de recogida",
        search_btn: "Buscar vehículos"
      },
      vehicles: {
        title: "Nuestra Flota",
        available: "Disponible",
        unavailable: "No disponible",
        per_day: "por día",
        seats: "asientos",
        transmission: "Transmisión",
        fuel: "Combustible",
        reserve_btn: "Reservar ahora",
        details_btn: "Ver detalles",
        auto: "Automático",
        manual: "Manual",
        gas: "Gasolina",
        diesel: "Diesel",
        electric: "Eléctrico",
        hybrid: "Híbrido"
      },
      reservation: {
        title: "Nueva Reservación",
        step1: "Fechas",
        step2: "Vehículo",
        step3: "Datos",
        step4: "Confirmación",
        pickup_date: "Fecha de recogida",
        return_date: "Fecha de devolución",
        pickup_location: "Lugar de recogida",
        return_location: "Lugar de devolución",
        total_days: "Total días",
        base_price: "Precio base",
        discount: "Descuento",
        taxes: "Impuestos",
        total: "Total",
        confirm_btn: "Confirmar reservación",
        cancel_btn: "Cancelar",
        back_btn: "Atrás",
        next_btn: "Siguiente",
        success: "Reservación creada exitosamente",
        code: "Código de reservación"
      },
      auth: {
        login_title: "Iniciar Sesión",
        register_title: "Crear Cuenta",
        email: "Correo electrónico",
        password: "Contraseña",
        name: "Nombre completo",
        phone: "Teléfono",
        login_btn: "Iniciar Sesión",
        register_btn: "Crear Cuenta",
        no_account: "¿No tienes cuenta?",
        have_account: "¿Ya tienes cuenta?",
        register_link: "Regístrate aquí",
        login_link: "Inicia sesión aquí"
      },
      categories: {
        all: "Todos",
        economy: "Económico",
        compact: "Compacto",
        suv: "SUV",
        luxury: "Lujo",
        van: "Van",
        pickup: "Pickup",
        electric: "Eléctrico"
      },
      errors: {
        required: "Este campo es requerido",
        invalid_email: "Email inválido",
        short_password: "Mínimo 6 caracteres",
        login_failed: "Credenciales incorrectas",
        server_error: "Error del servidor"
      },
      themes: {
        title: "Tema",
        midnight: "Midnight Blue",
        ocean: "Ocean Dark",
        pearl: "Pearl Light",
        sunset: "Sunset Sport"
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: "Home",
        fleet: "Fleet",
        login: "Login",
        logout: "Logout",
        profile: "My Profile",
        admin: "Admin Panel"
      },
      home: {
        hero_title: "DRIVE YOUR ADVENTURE",
        hero_subtitle: "The best vehicles at the best price",
        search_title: "Find your ideal vehicle",
        pickup_date: "Pickup date",
        return_date: "Return date",
        pickup_location: "Pickup location",
        search_btn: "Search vehicles"
      },
      vehicles: {
        title: "Our Fleet",
        available: "Available",
        unavailable: "Not available",
        per_day: "per day",
        seats: "seats",
        transmission: "Transmission",
        fuel: "Fuel",
        reserve_btn: "Reserve now",
        details_btn: "View details",
        auto: "Automatic",
        manual: "Manual",
        gas: "Gas",
        diesel: "Diesel",
        electric: "Electric",
        hybrid: "Hybrid"
      },
      reservation: {
        title: "New Reservation",
        step1: "Dates",
        step2: "Vehicle",
        step3: "Details",
        step4: "Confirmation",
        pickup_date: "Pickup date",
        return_date: "Return date",
        pickup_location: "Pickup location",
        return_location: "Return location",
        total_days: "Total days",
        base_price: "Base price",
        discount: "Discount",
        taxes: "Taxes",
        total: "Total",
        confirm_btn: "Confirm reservation",
        cancel_btn: "Cancel",
        back_btn: "Back",
        next_btn: "Next",
        success: "Reservation created successfully",
        code: "Reservation code"
      },
      auth: {
        login_title: "Login",
        register_title: "Create Account",
        email: "Email address",
        password: "Password",
        name: "Full name",
        phone: "Phone",
        login_btn: "Login",
        register_btn: "Create Account",
        no_account: "Don't have an account?",
        have_account: "Already have an account?",
        register_link: "Register here",
        login_link: "Login here"
      },
      categories: {
        all: "All",
        economy: "Economy",
        compact: "Compact",
        suv: "SUV",
        luxury: "Luxury",
        van: "Van",
        pickup: "Pickup",
        electric: "Electric"
      },
      errors: {
        required: "This field is required",
        invalid_email: "Invalid email",
        short_password: "Minimum 6 characters",
        login_failed: "Invalid credentials",
        server_error: "Server error"
      },
      themes: {
        title: "Theme",
        midnight: "Midnight Blue",
        ocean: "Ocean Dark",
        pearl: "Pearl Light",
        sunset: "Sunset Sport"
      }
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('language') || 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false
  }
})

export default i18n