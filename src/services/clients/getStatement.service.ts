import {
  IClient,
  IClientRepository,
  IDbTransaction,
} from '@/repositories/client'
import { NotFound } from '@/utils/error'
import { R } from '@/utils/result'

interface ITransaction {
  valor: number
  tipo: string
  descricao: string
  realizada_em: string
}

interface IBalance {
  total: number
  data_extrato: string
  limite: number
}

interface IStatement {
  saldo: IBalance
  ultimas_transacoes: ITransaction[]
}

export class GetStatementService {
  constructor(private clientRepository: IClientRepository) {}

  async execute(clientId: number): Promise<R<IStatement>> {
    const data = await this.clientRepository.findLast10Transactions(clientId)
    if (data.isFail()) return R.fail(new NotFound('Client not found'))
    const result = this.formatStatements(data.getValue())

    return R.ok(result)
  }

  formatStatements(
    data: IClient & { transactions: IDbTransaction[] },
  ): IStatement {
    return {
      saldo: {
        total: Number(data.balance),
        data_extrato: new Date().toISOString(),
        limite: Number(data.limit),
      },
      ultimas_transacoes: data.transactions?.map(
        (t) =>
          ({
            valor: Number(t.amount),
            tipo: t.type === 'credit' ? 'c' : 'd',
            descricao: t.description,
            realizada_em: t.created_at,
          } || []),
      ),
    }
  }
}
