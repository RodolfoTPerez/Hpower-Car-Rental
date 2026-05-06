// Respuestas estándar de la API
const success = (res, data, message = 'OK', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  })
}

const error = (res, message = 'Error interno', status = 500, err = null) => {
  return res.status(status).json({
    success: false,
    message,
    error: err ? err.message : null
  })
}

module.exports = { success, error }