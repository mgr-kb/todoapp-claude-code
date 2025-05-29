// Server Actions の戻り値型定義

export type ActionResult<TData = unknown> = 
  | { status: 'success'; data?: TData }
  | { status: 'error'; error: { form?: string[]; [key: string]: string[] | undefined } }
  | { status: 'validation-error'; error: Record<string, string[] | null> | null };

export type TodoCreateActionResult = ActionResult;