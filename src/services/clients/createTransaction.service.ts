import { IClient, IClientRepository, ITransaction } from '@/repositories/client'
import { BadRequest } from '@/utils/error'
import { R } from '@/utils/result'

interface IResponse {
  limite: number
  saldo: number
}

export class CreateTransactionService {
  constructor(private clientRepository: IClientRepository) {}

  async execute(
    clientId: number,
    transaction: ITransaction,
  ): Promise<R<IResponse>> {
    const validate = this.validate(transaction)
    if (validate.isFail()) return R.fail(validate.getError())

    const result = await this.process(clientId, transaction)
    if (result.isFail()) return R.fail(result.getError())

    const { limit, balance } = result.getValue()

    return R.ok({
      limite: Number(limit),
      saldo: Number(balance),
    })
  }

  async process(
    clientId: number,
    transaction: ITransaction,
  ): Promise<R<IClient>> {
    if (transaction.tipo === 'c') {
      return this.processCredit(clientId, transaction)
    }
    return this.processDebit(clientId, transaction)
  }

  async processCredit(
    clientId: number,
    transaction: ITransaction,
  ): Promise<R<IClient>> {
    const result = await this.clientRepository.createCreditTransaction(
      clientId,
      transaction,
    )
    return result
  }

  async processDebit(
    clientId: number,
    transaction: ITransaction,
  ): Promise<R<IClient>> {
    const result = await this.clientRepository.createDebitTransaction(
      clientId,
      transaction,
    )
    return result
  }

  validate(transaction: ITransaction): R<void> {
    const { valor, descricao, tipo } = transaction

    if (!valor || valor < 0) {
      return R.fail(new BadRequest('Invalid "valor"'))
    }

    if (!descricao || descricao.length < 1 || descricao.length > 10) {
      return R.fail(new BadRequest('Invalid "descricao"'))
    }

    if (!['c', 'd'].includes(tipo)) {
      return R.fail(new BadRequest('Invalid "tipo"'))
    }

    return R.ok()
  }
}
