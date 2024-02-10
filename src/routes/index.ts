import express, { Router } from 'express'
import clientsController from '@/controllers/clients'

const router: Router = express.Router()

router
  .route('/clientes/:id/transacoes')
  .post(clientsController.createTransaction)

export default router
