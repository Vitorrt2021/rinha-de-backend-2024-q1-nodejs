import express, { Express } from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import routes from '@/routes'
import { errorHandler } from './utils/error'

const app: Express = express()

app.use(helmet())
app.use(cors())
app.options('*', cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(compression())

app.use('/', routes)

app.use(errorHandler)

export default app
