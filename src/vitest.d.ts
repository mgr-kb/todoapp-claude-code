import type { TestAPI } from 'vitest';

declare global {
  namespace ImportMeta {
    interface ImportMeta {
      vitest?: TestAPI;
    }
  }
}

export {};