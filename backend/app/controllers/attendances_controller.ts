import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Attendance from '#models/attendance'
import Course from '#models/course'
import { markAttendance, scanStudent } from '#abilities/main'

export default class AttendancesController {

  /**
   * Called when a QR code is scanned.
   * Checks if the student exists and returns their profile.
   * Uses 'scanStudent' ability (Generic role check).
   */
  async checkStudent({ params, response, bouncer }: HttpContext & { bouncer: any }) {
    if (await bouncer.denies(scanStudent)) {
        return response.forbidden('Accès non autorisé au scanner. Rôle PROF ou ADMIN requis.')
    }

    const { uuid } = params

    try {
      const student = await User.query()
        .where('role', 'STUDENT')
        .where('student_uuid', uuid)
        .firstOrFail()

      return response.ok({
        valid: true,
        student: {
          id: student.id,
          name: student.fullName,
          major: student.major,
          level: student.level,
          paymentStatus: student.paymentStatus,
          avatarUrl: student.avatarUrl
        },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      return response.ok({
        valid: false,
        message: 'Étudiant introuvable ou code invalide',
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Confirms the attendance and saves it to DB.
   * Uses 'markAttendance' ability (Strict ownership check).
   */
  async store({ request, response, auth, bouncer }: HttpContext & { auth: any, bouncer: any }) {
    const data = request.only(['studentId', 'courseId', 'status'])
    
    // 1. Fetch the course first to establish context
    let course
    try {
        course = await Course.findOrFail(data.courseId)
    } catch (e) {
        return response.notFound('Cours introuvable')
    }

    // 2. Strict Check: Is this user allowed to mark attendance for THIS specific course?
    if (await bouncer.denies(markAttendance, course)) {
        return response.forbidden("Accès refusé. Vous n'êtes pas le professeur assigné à ce cours.")
    }

    const status = data.status || 'PRESENT'
    const professor = auth.user!

    // Check for duplicate scan today
    const existing = await Attendance.query()
      .where('student_id', data.studentId)
      .where('course_id', data.courseId)
      .whereRaw('DATE(created_at) = CURDATE()')
      .first()

    if (existing) {
      // Update existing record
      existing.status = status
      existing.scannedById = professor.id
      await existing.save()
      
      return response.ok({
        success: true,
        data: existing,
        message: 'Statut mis à jour'
      })
    }

    // Create New Attendance
    const attendance = await Attendance.create({
      studentId: data.studentId,
      courseId: data.courseId,
      scannedById: professor.id,
      status: status
    })

    return response.created({
      success: true,
      data: attendance
    })
  }
}