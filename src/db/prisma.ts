import { PrismaClient } from '@prisma/client'

class PrismaConnector {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  public connect() {
    if (!this.prisma) {
      this.prisma = new PrismaClient()
    }
    return this.prisma
  }
}

export default new PrismaConnector()
