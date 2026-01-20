import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class GlobalErrorHandlerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      await next()
    } catch (error) {
      const status = error.status || 500
      const message = error.message || 'Internal Server Error'
      const code = error.code || 'E_INTERNAL_SERVER_ERROR'

      // Optional: Log error to console or external service
      // console.error('[GlobalErrorHandler]', error)

      return ctx.response.status(status).json({
        error: {
          message,
          code,
          status,
          details: error.messages || undefined // Exposes validation errors if present
        }
      })
    }
  }
}