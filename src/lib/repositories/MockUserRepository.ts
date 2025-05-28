import { IUserRepository } from './interfaces/IUserRepository';

export class MockUserRepository implements IUserRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createUserIfNotExists(_userId: string): Promise<void> {
    // Mock implementation doesn't require actual user creation
    return;
  }
}