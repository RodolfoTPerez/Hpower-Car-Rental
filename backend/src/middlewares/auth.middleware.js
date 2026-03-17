const jwt = require('jsonwebtoken')
const { error } = require('../utils/response')

// Verifica que el token JWT sea válido
const authenticate = (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return error(res, 'Token requerido', 401)
    }
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return error(res, 'Token inválido o expirado', 401)
  }
}

// Verifica que el usuario tenga el rol requerido
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, 'No tienes permiso para esta acción', 403)
    }
    next()
  }
}

module.exports = { authenticate, authorize }