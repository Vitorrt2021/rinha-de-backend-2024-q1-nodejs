import { $Enums } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import prisma from '@/db/prisma'
import { InternalServer, NotFound, UnprocessableEntity } from '@/utils/error'
import { R } from '@/utils/result'

export interface IClient {
  id: number
  balance: Decimal
  limit: Decimal
  created_at: Date
  updated_at: Date
}

export interface ITransaction {
  valor: number
  tipo: 'c' | 'd'
  descricao: string
}

export interface IDbTransaction {
  id: number
  client_id: number
  amount: Decimal
  type: $Enums.transaction_type
  description: string
  created_at: string
  updated_at: string
}

export interface IClientRepository {
  findById: (id: number, trx) => Promise<IClient | null>
  createCreditTransaction: (
    clientId: number,
    transaction: ITransaction,
  ) => Promise<R<IClient>>
  createDebitTransaction: (
    clientId: number,
    transaction: ITransaction,
  ) => Promise<R<IClient>>
  create: (client: { balance: number; limit: number }) => Promise<IClient>
  findLast10Transactions: (
    clientId: number,
  ) => Promise<R<IClient & { transactions: IDbTransaction[] }>>
}

export class ClientRepository implements IClientRepository {
  async findById(id: number, trx) {
    const result = await trx.clients.findFirst({
      where: { id },
    })
    return result
  }

  async createCreditTransaction(
    clientId: number,
    transaction: ITransaction,
  ): Promise<R<IClient>> {
    try {
      const result: {
        result: IClient
      }[] = await prisma.connect().$queryRaw`
        select process_credit(${clientId}::int, ${transaction.valor}::numeric, ${transaction.descricao}) as result
      `
      return R.ok(result[0]!.result)
    } catch (err) {
      return R.fail(this.parseError(err))
    }
  }

  async createDebitTransaction(
    clientId: number,
    transaction: ITransaction,
  ): Promise<R<IClient>> {
    try {
      const result: {
        result: IClient
      }[] = await prisma.connect().$queryRaw`
        select process_debit(${clientId}::int, ${transaction.valor}::numeric, ${transaction.descricao}) as result
      `
      return R.ok(result[0]!.result)
    } catch (err) {
      return R.fail(this.parseError(err))
    }
  }

  parseError(err) {
    const { meta } = err
    if (meta) {
      if (meta.message === 'ERROR: Client does not exist') {
        return new NotFound('Client does not exist')
      }
      if (meta.message === 'ERROR: Limit exceeded') {
        return new UnprocessableEntity('Limit exceeded')
      }
    }

    return new InternalServer('Internal Server Error')
  }

  async findLast10Transactions(
    clientId: number,
  ): Promise<R<IClient & { transactions: IDbTransaction[] }>> {
    try {
      const result: (IClient & { transactions: IDbTransaction[] })[] =
        await prisma.connect().$queryRaw`
        SELECT
          c.*,
          (
            SELECT json_agg(row_to_json(t.*))
            FROM (
                SELECT *
                FROM transactions
                WHERE client_id = c.id
                ORDER BY id DESC
                LIMIT 10
            ) t
        ) AS transactions
        FROM clients c
        WHERE c.id = ${clientId}
      `

      if (!result[0]) return R.fail(new NotFound('Client not found'))
      return R.ok(result[0])
    } catch (err) {
      return R.fail(this.parseError(err))
    }
  }

  async create(client: { balance: number; limit: number }): Promise<IClient> {
    const result = await prisma.connect().clients.create({
      data: client,
    })

    return result
  }
}
