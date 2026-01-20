import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import { createCourse, editCourse, viewCourses } from '#abilities/main'

export default class CoursesController {
  
  /**
   * List courses.
   * Admin sees all, Prof sees their own.
   */
  async index({ response, auth, bouncer }: HttpContext & { auth: any, bouncer: any }) {
    if (await bouncer.denies(viewCourses)) {
        return response.forbidden('Accès refusé.')
    }

    const user = auth.user!
    let courses

    if (user.role === 'ADMIN') {
      courses = await Course.all()
    } else {
      // Professors only see their courses. 
      // Students logic could be added here to see enrolled courses.
      courses = await Course.query().where('professor_id', user.id)
    }

    return response.ok(courses)
  }

  /**
   * Create a new course.
   */
  async store({ request, response, auth, bouncer }: HttpContext & { auth: any, bouncer: any }) {
    if (await bouncer.denies(createCourse)) {
      return response.forbidden('Vous ne pouvez pas créer de cours.')
    }

    const data = request.only(['title', 'code', 'schedule'])
    const user = auth.user!

    // Validate data (In real app, use Validator)
    if (!data.title || !data.code || !data.schedule) {
        return response.badRequest('Tous les champs sont requis')
    }

    const course = await Course.create({
      ...data,
      professorId: user.id // Assign to current user (assuming Prof creates their own)
    })

    return response.created(course)
  }

  /**
   * Update a course.
   */
  async update({ params, request, response, bouncer }: HttpContext & { bouncer: any }) {
    const course = await Course.findOrFail(params.id)

    // Checks ownership (Prof) or Admin rights
    if (await bouncer.denies(editCourse, course)) {
      return response.forbidden('Vous ne pouvez pas modifier ce cours (non propriétaire).')
    }

    const data = request.only(['title', 'code', 'schedule'])
    course.merge(data)
    await course.save()

    return response.ok(course)
  }

  /**
   * Delete a course.
   */
  async destroy({ params, response, bouncer }: HttpContext & { bouncer: any }) {
    const course = await Course.findOrFail(params.id)

    // Checks ownership (Prof) or Admin rights (Reusing editCourse ability logic as it's the same)
    if (await bouncer.denies(editCourse, course)) {
      return response.forbidden('Vous ne pouvez pas supprimer ce cours (non propriétaire).')
    }

    await course.delete()
    return response.noContent()
  }
}