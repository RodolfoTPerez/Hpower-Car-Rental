const supabase = require('../config/supabase')

// Connection pool manager para optimizar conexiones a Supabase
class ConnectionPool {
  constructor(maxConnections = 10) {
    this.maxConnections = maxConnections
    this.activeConnections = 0
    this.connectionQueue = []
  }

  async execute(queryFn) {
    return new Promise((resolve, reject) => {
      if (this.activeConnections < this.maxConnections) {
        this.activeConnections++
        this._executeQuery(queryFn, resolve, reject)
      } else {
        this.connectionQueue.push({ queryFn, resolve, reject })
      }
    })
  }

  async _executeQuery(queryFn, resolve, reject) {
    try {
      const result = await queryFn()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.activeConnections--
      this._processQueue()
    }
  }

  _processQueue() {
    if (this.connectionQueue.length > 0 && this.activeConnections < this.maxConnections) {
      const { queryFn, resolve, reject } = this.connectionQueue.shift()
      this.activeConnections++
      this._executeQuery(queryFn, resolve, reject)
    }
  }

  getStats() {
    return {
      active: this.activeConnections,
      max: this.maxConnections,
      queued: this.connectionQueue.length
    }
  }
}

const connectionPool = new ConnectionPool()

// Función wrapper para ejecutar consultas con pooling
const withConnectionPool = (queryFn) => {
  return connectionPool.execute(queryFn)
}

// Cache para consultas frecuentes con TTL
class QueryCache {
  constructor(maxSize = 100, ttl = 300000) { // 5 minutos default
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear() {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    }
  }
}

const queryCache = new QueryCache()

// Función para ejecutar consultas con caché
const withCache = (key, queryFn, useCache = true) => {
  if (!useCache) {
    return queryFn()
  }

  const cached = queryCache.get(key)
  if (cached) {
    return Promise.resolve(cached)
  }

  return queryFn().then(result => {
    queryCache.set(key, result)
    return result
  })
}

// Monitoreo de memoria
const getMemoryStats = () => {
  const usage = process.memoryUsage()
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    external: Math.round(usage.external / 1024 / 1024) + 'MB',
    rss: Math.round(usage.rss / 1024 / 1024) + 'MB'
  }
}

// Cleanup forzado cada 10 minutos
setInterval(() => {
  if (global.gc) {
    global.gc()
    console.log('🗑️  Garbage collection forzada')
  }
}, 10 * 60 * 1000)

module.exports = {
  withConnectionPool,
  withCache,
  getMemoryStats,
  connectionPool,
  queryCache
}
