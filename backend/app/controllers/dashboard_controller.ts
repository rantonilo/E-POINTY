import type { HttpContext } from '@adonisjs/core/http'
import { viewFinanceStats } from '#abilities/main'

export default class DashboardController {
  
  /**
   * Return statistics for the direction dashboard.
   */
  // Added { bouncer: any } to context type to fix TS error
  async index({ response, bouncer }: HttpContext & { bouncer: any }) {
    if (await bouncer.denies(viewFinanceStats)) {
        return response.forbidden('Accès refusé. Réservé à la Direction ou Admin.')
    }

    // In a real implementation, you would calculate these from the database
    // const totalStudents = await User.query().where('role', 'STUDENT').count('* as total')
    
    // For now, we return structured mock data compatible with the frontend charts
    const stats = [
      { name: 'Jan', revenue: 4000, attendance: 90 },
      { name: 'Feb', revenue: 3000, attendance: 85 },
      { name: 'Mar', revenue: 2000, attendance: 88 },
      { name: 'Apr', revenue: 2780, attendance: 92 },
      { name: 'May', revenue: 1890, attendance: 80 },
      { name: 'Jun', revenue: 2390, attendance: 85 },
    ]

    return response.ok(stats)
  }
}