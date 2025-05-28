import { ITodoRepository } from '@/lib/repositories/interfaces/ITodoRepository';
import { IUserRepository } from '@/lib/repositories/interfaces/IUserRepository';
import { DatabaseTodoRepository } from '@/lib/repositories/DatabaseTodoRepository';
import { MockTodoRepository } from '@/lib/repositories/MockTodoRepository';
import { DatabaseUserRepository } from '@/lib/repositories/DatabaseUserRepository';
import { MockUserRepository } from '@/lib/repositories/MockUserRepository';

export type DataSourceType = 'mock' | 'database';

export class RepositoryFactory {
  static createTodoRepository(dataSource: DataSourceType): ITodoRepository {
    switch (dataSource) {
      case 'mock':
        return new MockTodoRepository();
      case 'database':
        return new DatabaseTodoRepository();
      default:
        throw new Error(`Unsupported data source: ${dataSource}`);
    }
  }

  static createUserRepository(dataSource: DataSourceType): IUserRepository {
    switch (dataSource) {
      case 'mock':
        return new MockUserRepository();
      case 'database':
        return new DatabaseUserRepository();
      default:
        throw new Error(`Unsupported data source: ${dataSource}`);
    }
  }

  static getDataSourceFromEnvironment(): DataSourceType {
    const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (dataSource === 'mock' || dataSource === 'database') {
      return dataSource;
    }
    // Default to mock if not specified or invalid
    return 'mock';
  }
}