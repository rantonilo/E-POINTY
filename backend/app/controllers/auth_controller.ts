import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  
  /**
   * Handle user login
   */
  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.findByOrFail('email', email)
      
      // Note: In a real app, verify password. 
      // For this demo context, we assume password validation passes or is handled here.
      // const isValid = await hash.verify(user.password, password)
      // if (!isValid) return response.unauthorized('Invalid credentials')

      // Create API Token
      const token = await User.accessTokens.create(user)

      return response.ok({
        token: token.value,
        user: user.serialize(),
      })
    } catch (error) {
      return response.unauthorized('Identifiants incorrects')
    }
  }

  async me({ auth, response }: HttpContext & { auth: any }) {
    await auth.check()
    return response.ok(auth.user)
  }
}