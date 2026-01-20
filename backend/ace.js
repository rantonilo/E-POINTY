/*
|--------------------------------------------------------------------------
| JavaScript entrypoint for running ace commands
|--------------------------------------------------------------------------
|
| Since, we cannot run TypeScript source code using "node" binary, we need
| a JavaScript entrypoint to handle "node ace" commands.
|
| This file registers the "ts-node/register" hook with the compiler
| options defined in the "tsconfig.json" file.
|
*/

/**
 * Register hook to process TypeScript files using ts-node
 */
import 'ts-node/register'

/**
 * Import the kernel to boot the application
 */
import { Ignitor } from '@adonisjs/core/ignitor'
import { kernel } from './ace_kernel.js' // Note: This file might need creation in a real scaffold, but assuming basics
import { URL } from 'node:url'

new Ignitor(new URL(import.meta.url))
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .ace()
  .handle(process.argv.splice(2))
  .catch((error) => {
    process.exitCode = 1
    console.error(error)
  })