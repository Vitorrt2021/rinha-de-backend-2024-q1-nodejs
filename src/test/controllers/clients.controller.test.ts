import supertest from 'supertest'
import app from '@/app'
import { ClientRepository } from '@/repositories/client'

describe('POST /clientes/:id/transacoes', () => {
  const application = supertest(app)

  it('should return 200', async () => {
    const client = await new ClientRepository().create({
      balance: 1000,
      limit: 1000,
    })
    const response = await application
      .post(`/clientes/${client.id}/transacoes`)
      .send({
        valor: 1000,
        tipo: 'c',
        descricao: 'descrição',
      })

    expect(response.status).toBe(200)
    expect(response.body).toStrictEqual({
      limite: 1000,
      saldo: 2000,
    })
  })

  it('should validate limit', async () => {
    const client = await new ClientRepository().create({
      balance: 1000,
      limit: 1000,
    })
    const response = await application
      .post(`/clientes/${client.id}/transacoes`)
      .send({
        valor: 3000,
        tipo: 'd',
        descricao: 'descrição',
      })

    expect(response.status).toBe(422)
  })

  it('should validate "valor"', async () => {
    const response = await application.post('/clientes/1/transacoes').send({
      valor: -10,
    })

    expect(response.status).toBe(400)
  })

  it('should validate "tipo"', async () => {
    const response = await application.post('/clientes/1/transacoes').send({
      valor: 1,
      tipo: 'a',
    })

    expect(response.status).toBe(400)
  })

  it('should validate "descricao"', async () => {
    const response = await application.post('/clientes/1/transacoes').send({
      valor: 1,
      tipo: 'a',
      descricao: 'Uma grande descrição',
    })

    expect(response.status).toBe(400)
  })
})

describe('GET /clientes/:id/extrato', () => {
  const application = supertest(app)

  it('should return 200', async () => {
    const repository = new ClientRepository()
    const client = await repository.create({
      balance: 1000,
      limit: 1000,
    })
    await repository.createCreditTransaction(client.id, {
      descricao: 'a',
      tipo: 'c',
      valor: 12,
    })
    await repository.createDebitTransaction(client.id, {
      descricao: 'a',
      tipo: 'd',
      valor: 12,
    })

    const response = await application.get(`/clientes/${client.id}/extrato`)

    expect(response.status).toBe(200)
    expect(response.body).toStrictEqual({
      saldo: {
        data_extrato: expect.any(String),
        limite: 1000,
        total: 1000,
      },
      ultimas_transacoes: [
        {
          descricao: 'a',
          realizada_em: expect.any(String),
          tipo: 'd',
          valor: 12,
        },
        {
          descricao: 'a',
          realizada_em: expect.any(String),
          tipo: 'c',
          valor: 12,
        },
      ],
    })
  })
})
