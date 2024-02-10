import { IClient, IClientRepository, ITransaction } from '@/repositories/client'
import { BadRequest, NotFound, UnprocessableEntity } from '@/utils/error'
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

    const client = await this.clientRepository.findById(clientId)
    if (!client) return R.fail(new NotFound('Client not found'))

    const result = await this.process(client, transaction)
    if (result.isFail()) return R.fail(result.getError())

    const { limit, balance } = result.getValue()

    return R.ok({
      limite: Number(limit),
      saldo: Number(balance),
    })
  }

  async process(
    client: IClient,
    transaction: ITransaction,
  ): Promise<R<IClient>> {
    if (transaction.tipo === 'c') {
      return this.processCredit(client, transaction)
    }
    return this.processDebit(client, transaction)
  }

  async processCredit(
    client: IClient,
    transaction: ITransaction,
  ): Promise<R<IClient>> {
    const result = await this.clientRepository.createCreditTransaction(
      client,
      transaction,
    )
    return R.ok(result)
  }

  async processDebit(
    client: IClient,
    transaction: ITransaction,
  ): Promise<R<IClient>> {
    if (client.balance - BigInt(transaction.valor) < client.limit) {
      return R.fail(new UnprocessableEntity('Limit exceeded'))
    }
    const result = await this.clientRepository.createDebitTransaction(
      client,
      transaction,
    )
    return R.ok(result)
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
