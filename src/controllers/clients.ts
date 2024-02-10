import { NextFunction, Request, Response } from 'express'
import { catchAsync } from '@/utils/async'
import { CreateTransactionService } from '@/services/clients.ts/createTransaction.service'
import { ClientRepository } from '@/repositories/client'

const createTransaction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req
    const { id } = req.params

    const clientRepository = new ClientRepository()
    const result = await new CreateTransactionService(clientRepository).execute(
      Number(id),
      body,
    )

    if (result.isFail()) return next(result.getError())

    res.json(result.getValue()).status(200)
  },
)

export default {
  createTransaction,
}
