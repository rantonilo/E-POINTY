import { Bouncer } from '@adonisjs/bouncer'
import User from '#models/user'
import Course from '#models/course'
import Payment from '#models/payment'

/**
 * --- GLOBAL ADMIN & USERS ---
 */
export const manageUsers = Bouncer.ability((user: User) => {
  return user.role === 'ADMIN'
})

/**
 * --- STUDENTS ---
 */
export const manageStudents = Bouncer.ability((user: User) => {
  return ['ADMIN', 'DIRECTION_MEMBER'].includes(user.role)
})

/**
 * --- FINANCE & DASHBOARD ---
 */
export const viewFinanceStats = Bouncer.ability((user: User) => {
  return ['ADMIN', 'DIRECTION_MEMBER'].includes(user.role)
})

/**
 * --- PAYMENTS ---
 */

/**
 * General ability to Create or Update payments.
 */
export const managePayments = Bouncer.ability((user: User) => {
  return ['ADMIN', 'DIRECTION_MEMBER'].includes(user.role)
})

/**
 * Granular ability to Delete a payment.
 * - ADMIN can delete any payment.
 * - DIRECTION_MEMBER can only delete 'PENDING' or 'LATE' payments.
 *   They cannot delete a 'PAID' record to preserve accounting integrity.
 */
export const deletePayment = Bouncer.ability((user: User, payment: Payment) => {
  if (user.role === 'ADMIN') return true
  
  if (user.role === 'DIRECTION_MEMBER') {
    // Prevent deletion of PAID records for audit trails
    return payment.status !== 'PAID'
  }
  
  return false
})

export const viewPayments = Bouncer.ability((user: User) => {
    return ['ADMIN', 'DIRECTION_MEMBER', 'STUDENT'].includes(user.role)
})

/**
 * --- COURSES ---
 */
export const viewCourses = Bouncer.ability((user: User) => {
  return true 
})

export const createCourse = Bouncer.ability((user: User) => {
  return ['ADMIN', 'PROF'].includes(user.role)
})

export const editCourse = Bouncer.ability((user: User, course: Course) => {
  if (user.role === 'ADMIN') return true
  if (user.role === 'PROF') return user.id === course.professorId
  return false
})

/**
 * --- ATTENDANCE ---
 */

/**
 * Ability to access the scanner feature and lookup a student.
 * Does not grant permission to validate the presence yet.
 */
export const scanStudent = Bouncer.ability((user: User) => {
  return ['ADMIN', 'PROF'].includes(user.role)
})

/**
 * Ability to confirm/mark attendance for a SPECIFIC course.
 * - ADMIN can mark for any course.
 * - PROF can ONLY mark for courses they teach.
 */
export const markAttendance = Bouncer.ability((user: User, course: Course) => {
  if (user.role === 'ADMIN') return true
  
  if (user.role === 'PROF') {
    return user.id === course.professorId
  }
  
  return false
})