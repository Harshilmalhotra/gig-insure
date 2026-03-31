import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // SQLite adapter for Prisma 7
    // PrismaBetterSqlite3 takes a config object with 'url', not a database instance
    const dbFile = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db';
    const adapter = new PrismaBetterSqlite3({ url: dbFile });
    
    super({ adapter: adapter as any });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
