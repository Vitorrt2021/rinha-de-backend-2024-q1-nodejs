import { $Enums } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import prisma from '@/db/prisma'

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
  created_at: Date
  updated_at: Date
}

export interface IClientRepository {
  findById: (id: number, trx) => Promise<IClient | null>
  createCreditTransaction: (
    client: IClient,
    transaction: ITransaction,
    trx,
  ) => Promise<IClient>
  createDebitTransaction: (
    client: IClient,
    transaction: ITransaction,
    trx,
  ) => Promise<IClient>
  create: (client: { balance: number; limit: number }) => Promise<IClient>
  findLast10Transactions: (
    clientId: number,
  ) => Promise<IClient & { transactions: IDbTransaction[] }>
  transaction: (fn: (trx) => Promise<any>) => Promise<any>
}

export class ClientRepository implements IClientRepository {
  async transaction(fn) {
    return prisma.connect().$transaction(fn, {
      isolationLevel: 'Serializable',
    })
  }

  async findById(id: number, trx) {
    const result = await trx.clients.findFirst({
      where: { id },
    })
    return result
  }

  async createCreditTransaction(
    client: IClient,
    transaction: ITransaction,
    trx,
  ) {
    const result = await trx.clients.update({
      where: { id: client.id },
      data: {
        balance: {
          increment: transaction.valor,
        },
        transactions: {
          create: {
            amount: transaction.valor,
            type: 'credit',
            description: transaction.descricao,
          },
        },
      },
    })
    return result
  }

  async createDebitTransaction(
    client: IClient,
    transaction: ITransaction,
    trx,
  ) {
    const result = await trx.clients.update({
      where: { id: client.id },
      data: {
        balance: {
          decrement: transaction.valor,
        },
        transactions: {
          create: {
            amount: transaction.valor,
            type: 'debit',
            description: transaction.descricao,
          },
        },
      },
    })
    return result
  }

  async findLast10Transactions(
    clientId: number,
  ): Promise<IClient & { transactions: IDbTransaction[] }> {
    const result = await prisma.connect().clients.findFirst({
      where: { id: clientId },
      include: {
        transactions: {
          orderBy: { id: 'desc' },
          take: 10,
        },
      },
    })

    return result as IClient & { transactions: IDbTransaction[] }
  }

  async create(client: { balance: number; limit: number }): Promise<IClient> {
    const result = await prisma.connect().clients.create({
      data: client,
    })

    return result
  }
}
