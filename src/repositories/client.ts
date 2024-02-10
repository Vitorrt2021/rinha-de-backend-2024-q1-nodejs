import prisma from '@/db/prisma'

export interface IClient {
  id: number
  balance: bigint
  limit: bigint
  created_at: Date
  updated_at: Date
}

export interface ITransaction {
  valor: number
  tipo: 'c' | 'd'
  descricao: string
}

export interface IClientRepository {
  findById: (id: number) => Promise<IClient | null>
  createCreditTransaction: (
    client: IClient,
    transaction: ITransaction,
  ) => Promise<IClient>
  createDebitTransaction: (
    client: IClient,
    transaction: ITransaction,
  ) => Promise<IClient>
  create: (client: { balance: number; limit: number }) => Promise<IClient>
}

export class ClientRepository implements IClientRepository {
  async findById(id: number) {
    const result = await prisma.connect().clients.findFirst({
      where: { id },
    })
    return result
  }

  async createCreditTransaction(client: IClient, transaction: ITransaction) {
    const result = await prisma.connect().clients.update({
      where: { id: client.id },
      data: {
        balance: {
          decrement: transaction.valor,
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

  async createDebitTransaction(client: IClient, transaction: ITransaction) {
    const result = await prisma.connect().clients.update({
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

  async create(client: { balance: number; limit: number }): Promise<IClient> {
    const result = await prisma.connect().clients.create({
      data: client,
    })

    return result
  }
}
