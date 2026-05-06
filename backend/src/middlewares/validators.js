const { body, validationResult } = require('express-validator')

const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
    })
  }
  next()
}

const authValidators = {
  register: [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres'),
    body('phone').optional(),
    validateRequest
  ],
  login: [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
    validateRequest
  ]
}

const vehiclesValidators = {
  create: [
    body('category_id').notEmpty().withMessage('Categoría requerida'),
    body('brand').trim().notEmpty().withMessage('Marca requerida'),
    body('model').trim().notEmpty().withMessage('Modelo requerido'),
    body('year').isInt({ min: 1900, max: 2099 }).withMessage('Año inválido'),
    body('license_plate').trim().notEmpty().withMessage('Placa requerida'),
    body('base_price_per_day').isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('seats').optional().isInt({ min: 1 }),
    body('transmission').optional().isIn(['MANUAL', 'AUTO']),
    body('fuel_type').optional().isIn(['GAS', 'DIESEL', 'HYBRID', 'ELECTRIC']),
    validateRequest
  ],
  update: [
    body('brand').optional().trim().notEmpty(),
    body('model').optional().trim().notEmpty(),
    body('year').optional().isInt({ min: 1900, max: 2099 }),
    body('base_price_per_day').optional().isFloat({ min: 0 }),
    body('seats').optional().isInt({ min: 1 }),
    body('status').optional().isIn(['AVAILABLE', 'MAINTENANCE', 'RENTED']),
    validateRequest
  ]
}

const reservationsValidators = {
  create: [
    body('vehicle_id').notEmpty().withMessage('Vehículo requerido'),
    body('pickup_date').isISO8601().withMessage('Fecha de recogida inválida'),
    body('return_date').isISO8601().withMessage('Fecha de devolución inválida'),
    body('pickup_location').notEmpty().withMessage('Lugar de recogida requerido'),
    body('return_location').notEmpty().withMessage('Lugar de devolución requerido'),
    validateRequest
  ],
  update: [
    body('status').optional().isIn(['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
    validateRequest
  ]
}

const pricingValidators = {
  create: [
    body('rule_name').notEmpty().withMessage('Nombre de regla requerido'),
    body('start_date').isISO8601().withMessage('Fecha inicial inválida'),
    body('end_date').isISO8601().withMessage('Fecha final inválida'),
    body('price_per_day').isFloat({ min: 0 }).withMessage('Precio por día inválido'),
    validateRequest
  ]
}

module.exports = {
  authValidators,
  vehiclesValidators,
  reservationsValidators,
  pricingValidators,
  validateRequest
}