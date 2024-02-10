import 'module-alias/register'

import config from '@/config'
import app from './app'

const server = app.listen(config.port, () => {
  console.log(`server listening on port ${config.port}`)
})

const exitHandler = async () => {
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
}

const unexpectedErrorHandler = (error: Error) => {
  console.log(error)
  exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', exitHandler)
