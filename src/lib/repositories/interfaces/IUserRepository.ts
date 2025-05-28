export interface IUserRepository {
  createUserIfNotExists(userId: string): Promise<void>;
}