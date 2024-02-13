import express, { Router } from 'express'
import clientsController from '@/controllers/clients'

const router: Router = express.Router()

router.route('/').get((_req, res) => {
  res.send('health')
})

router
  .route('/clientes/:id/transacoes')
  .post(clientsController.createTransaction)

router.route('/clientes/:id/extrato').get(clientsController.getStatement)

export default router
