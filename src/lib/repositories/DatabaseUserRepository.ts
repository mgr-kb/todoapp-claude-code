import { prisma } from '@/lib/prisma';
import { IUserRepository } from './interfaces/IUserRepository';

export class DatabaseUserRepository implements IUserRepository {
  async createUserIfNotExists(userId: string): Promise<void> {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });
  }
}