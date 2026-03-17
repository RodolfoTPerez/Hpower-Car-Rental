const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../config/supabase')
const { success, error } = require('../utils/response')

const generateTokens = (user) => {
  const access = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
  const refresh = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
  return { access, refresh }
}

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password)
      return error(res, 'Nombre, email y password son requeridos', 400)

    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).single()

    if (existing) return error(res, 'El email ya está registrado', 400)

    const password_hash = await bcrypt.hash(password, 12)

    const { data: user, error: err } = await supabase
      .from('users')
      .insert([{ name, email, password_hash, phone, role: 'CUSTOMER' }])
      .select('id, name, email, phone, role, created_at')
      .single()

    if (err) return error(res, 'Error al crear usuario', 500, err)

    const tokens = generateTokens(user)
    return success(res, { user, tokens }, 'Usuario registrado correctamente', 201)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return error(res, 'Email y password son requeridos', 400)

    const { data: user, error: err } = await supabase
      .from('users')
      .select('id, name, email, phone, role, password_hash, is_active')
      .eq('email', email)
      .single()

    if (err || !user) return error(res, 'Credenciales incorrectas', 401)
    if (!user.is_active) return error(res, 'Usuario inactivo', 401)

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return error(res, 'Credenciales incorrectas', 401)

    const { password_hash, ...userClean } = user
    const tokens = generateTokens(userClean)

    return success(res, { user: userClean, tokens }, 'Login exitoso')
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

const logout = async (req, res) => {
  return success(res, null, 'Sesión cerrada correctamente')
}

const me = async (req, res) => {
  try {
    const { data: user, error: err } = await supabase
      .from('users')
      .select('id, name, email, phone, role, is_active, created_at')
      .eq('id', req.user.id)
      .single()

    if (err || !user) return error(res, 'Usuario no encontrado', 404)
    return success(res, user)
  } catch (err) {
    return error(res, 'Error interno', 500, err)
  }
}

module.exports = { register, login, logout, me }