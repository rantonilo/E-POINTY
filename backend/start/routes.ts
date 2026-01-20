/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const AttendancesController = () => import('#controllers/attendances_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const StudentsController = () => import('#controllers/students_controller')
const CoursesController = () => import('#controllers/courses_controller')
const PaymentsController = () => import('#controllers/payments_controller')
const UsersController = () => import('#controllers/users_controller')

// Lazy load the error handler middleware
const GlobalErrorHandler = () => import('#middleware/global_error_handler_middleware')

router.group(() => {

  // --- Public Routes ---
  router.post('login', [AuthController, 'login'])

  // --- Protected Routes ---
  router.group(() => {
    
    router.get('me', [AuthController, 'me'])

    // Routes Courses Management
    router.resource('courses', CoursesController).apiOnly()
    
    // Routes Payments Management
    router.resource('payments', PaymentsController).apiOnly()

    // Routes Users Management (Admin)
    router.resource('users', UsersController).apiOnly()

    // Routes Professeurs (Scanner)
    router.group(() => {
      router.get('students/:uuid', [AttendancesController, 'checkStudent'])
      router.post('attendances', [AttendancesController, 'store'])
    }).middleware(middleware.auth({ guards: ['api'] }))

    // Routes Direction & Admin
    router.group(() => {
      router.get('stats/direction', [DashboardController, 'index'])
      router.get('students', [StudentsController, 'index'])
      router.post('students', [StudentsController, 'store'])
    }).middleware(middleware.auth({ guards: ['api'] }))

  }).use(middleware.auth())

}).prefix('api').use(async (ctx, next) => {
  const { default: Handler } = await GlobalErrorHandler()
  await new Handler().handle(ctx, next)
})