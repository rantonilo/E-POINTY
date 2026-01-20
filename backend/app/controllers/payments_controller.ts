import type { HttpContext } from '@adonisjs/core/http'
import Payment from '#models/payment'
import { managePayments, viewPayments, deletePayment } from '#abilities/main'

export default class PaymentsController {

  /**
   * List payments.
   */
  async index({ response, auth, bouncer }: HttpContext & { auth: any, bouncer: any }) {
    if (await bouncer.denies(viewPayments)) {
      return response.forbidden('Accès refusé.')
    }

    const user = auth.user!
    let payments

    if (user.role === 'STUDENT') {
      payments = await Payment.query().where('student_id', user.id).orderBy('due_date', 'asc')
    } else {
      // Admin / Direction
      payments = await Payment.query().preload('student').orderBy('created_at', 'desc')
    }

    return response.ok(payments)
  }

  /**
   * Create a new payment record (Invoice).
   */
  async store({ request, response, bouncer }: HttpContext & { bouncer: any }) {
    if (await bouncer.denies(managePayments)) {
      return response.forbidden('Accès refusé. Réservé à l\'administration.')
    }

    const data = request.only(['studentId', 'title', 'amount', 'dueDate', 'status'])
    
    const payment = await Payment.create(data)
    return response.created(payment)
  }

  /**
   * Update payment status.
   */
  async update({ params, request, response, bouncer }: HttpContext & { bouncer: any }) {
    if (await bouncer.denies(managePayments)) {
      return response.forbidden('Accès refusé. Réservé à l\'administration.')
    }

    const payment = await Payment.findOrFail(params.id)
    const data = request.only(['status', 'title', 'amount', 'dueDate'])
    
    payment.merge(data)
    await payment.save()

    return response.ok(payment)
  }

  /**
   * Delete a payment record.
   * Uses granular 'deletePayment' check to protect PAID records.
   */
  async destroy({ params, response, bouncer }: HttpContext & { bouncer: any }) {
    const payment = await Payment.findOrFail(params.id)

    // Granular Check: Can this user delete THIS specific payment?
    if (await bouncer.denies(deletePayment, payment)) {
      return response.forbidden('Action impossible. Seul un Admin peut supprimer un paiement déjà validé (PAID).')
    }

    await payment.delete()
    return response.noContent()
  }
}