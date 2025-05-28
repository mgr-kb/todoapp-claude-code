# Next.js (App Router)

## データフェッチ

Server Componentsによるデータフェッチを行う。
データフェッチを行うにあたっては、Request Memoizationを意識する。

参考資料
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- https://nextjs.org/docs/app/deep-dive/caching

データフェッチを行う場合、`*.tsx`のようなReactコンポーネントファイルでは直接`fetch`を利用するのではなく、
任意のドメイン階層に`app/**/fetcher.ts`のようにfetcherであることがわかるようにファイルを準備して、fetch用の関数を用意してexportして利用する。

## ユーザーアクション

ユーザーによるアクションを伴う処理(C/U/D)には、`Server Actions`と`useActionsState()`を利用する。
ユーザー操作に伴ってデータを操作・更新を行なって、その後の結果を再度取得したい場合には、`revalidatePath()`と`revalidateTag()`を用いる。

参考資料
- https://react.dev/reference/react/useActionState
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

## Server Component / Client Component

`page.tsx`で `use client`を扱ってはいけない。
`use client`を扱うケースは下記のようなケース。

- クライアントサイド処理
- サードパーティコンポーネント
- RSC Payload転送量の削減

参考資料
- https://zenn.dev/akfm/books/nextjs-basic-principle/viewer/part_2_client_components_usecase

どうしても `use client`をコンポーネントツリーの中でルートに近い階層で用いる場合には、Composition patternを用いる。

```tsx
// side-menu.tsx
"use client";

import { useState } from "react";

// `children`に`<UserInfo>`などのServer Componentsを渡すことが可能！
export function SideMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children}
      <div>
        <button type="button" onClick={() => setOpen((prev) => !prev)}>
          toggle
        </button>
        <div>...</div>
      </div>
    </>
  );
}
```

```tsx
// page.tsx
import { UserInfo } from "./user-info"; // Server Components
import { SideMenu } from "./side-menu"; // Client Components

/**
 * Client Components(`<SideMenu>`)の子要素として
 * Server Components(`<UserInfo>`)を渡せる
 */
export function Page() {
  return (
    <div>
      <SideMenu>
        <UserInfo />
      </SideMenu>
      <main>{/* ... */}</main>
    </div>
  );
}
```
