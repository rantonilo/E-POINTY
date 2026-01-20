import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { manageStudents } from '#abilities/main'
import { randomUUID } from 'node:crypto'

export default class StudentsController {
  
  /**
   * List all students.
   * Protected by 'manageStudents' ability.
   */
  // Added { bouncer: any } to context type to fix TS error
  async index({ response, bouncer }: HttpContext & { bouncer: any }) {
    if (await bouncer.denies(manageStudents)) {
      return response.forbidden('Vous n\'avez pas les droits pour consulter la liste des étudiants.')
    }

    const students = await User.query()
      .where('role', 'STUDENT')
      .orderBy('full_name', 'asc')

    return response.ok(students)
  }

  /**
   * Create a new student.
   */
  async store({ request, response, bouncer }: HttpContext & { bouncer: any }) {
    if (await bouncer.denies(manageStudents)) {
        return response.forbidden('Vous n\'avez pas les droits pour créer un étudiant.')
    }

    const data = request.only(['fullName', 'email', 'major', 'level'])
    
    // Basic validation
    if (!data.fullName || !data.email) {
        return response.badRequest('Le nom et l\'email sont obligatoires.')
    }

    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
        return response.badRequest('Cet email est déjà utilisé.')
    }

    const student = await User.create({
        fullName: data.fullName,
        email: data.email,
        password: 'password123', // Default password
        role: 'STUDENT',
        studentUuid: randomUUID(),
        major: data.major,
        level: data.level,
        paymentStatus: 'PENDING',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=random`
    })

    return response.created(student)
  }
}