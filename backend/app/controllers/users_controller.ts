import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { manageUsers } from '#abilities/main'
import string from '@adonisjs/core/helpers/string'
// import mail from '@adonisjs/mail/services/main' // Uncomment in real app

export default class UsersController {
  /**
   * List all users.
   */
  async index({ response, bouncer }: HttpContext & { bouncer: any }) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden('Accès refusé. Réservé aux administrateurs.')
    }

    const users = await User.query().orderBy('created_at', 'desc')
    return response.ok(users)
  }

  /**
   * Create a new user with auto-generated password.
   */
  async store({ request, response, bouncer }: HttpContext & { bouncer: any }) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden('Accès refusé. Réservé aux administrateurs.')
    }

    const data = request.only(['fullName', 'email', 'role', 'avatarUrl'])
    const senderEmail = request.input('senderEmail', 'admin@epointy.edu') // Get sender from request or default
    
    // Basic validation
    if (!data.email || !data.role) {
        return response.badRequest('Champs manquants')
    }

    // Check email unicity
    const existing = await User.findBy('email', data.email)
    if (existing) {
        return response.badRequest('Cet email est déjà utilisé')
    }

    // 1. Generate Robust 8-char password
    const password = string.random(8)

    // 2. Create User
    const user = await User.create({
        ...data,
        password: password // Model hooks should hash this
    })

    // 3. Send Email (Simulated logic here, use @adonisjs/mail in production)
    console.log(`[EMAIL SERVICE] Sending password ${password} to ${data.email} from ${senderEmail}`)
    
    /* 
    await mail.send((message) => {
        message
            .from(senderEmail)
            .to(data.email)
            .subject('Vos identifiants E-POINTY')
            .htmlView('emails/welcome', { user, password })
    })
    */

    return response.created(user)
  }

  /**
   * Update a user.
   */
  async update({ params, request, response, bouncer }: HttpContext & { bouncer: any }) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden('Accès refusé. Réservé aux administrateurs.')
    }

    const user = await User.findOrFail(params.id)
    const data = request.only(['fullName', 'email', 'role', 'avatarUrl']) 

    user.merge(data)
    await user.save()

    return response.ok(user)
  }

  /**
   * Delete a user.
   */
  async destroy({ params, response, bouncer }: HttpContext & { bouncer: any }) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden('Accès refusé. Réservé aux administrateurs.')
    }

    const user = await User.findOrFail(params.id)
    await user.delete()

    return response.noContent()
  }
}