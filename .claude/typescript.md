# TypeScript

## 命名規則

フロントエンド、バックエンドを問わず以下の命名規則に従う。

- ディレクトリ名: ケバブケース
- ファイル名: ケバブケース
- コンポーネント名: パスカルケース
- 型名: パスカルケース

## モジュール

- ライブラリやフレームワークの制限がない限り、Named exports を使用する
- `export`は対象とする関数や定数の先頭に書く
- 相対パスによるインポートは同一モジュール内でのみ許可する

## ドメイン型集約
src/types.ts にアプリケーション内のドメインモデルを集約する。
その型がどのように使われるかを jsdoc スタイルのコメントで記述

```ts
/**
 * キャッシュのインターフェース抽象
 */
export type AsyncCache<T> = {
  get(): Promise<T | void>;
  has(): Promise<boolean>;
  set(value: T): Promise<void>;
}
```

## TS + 関数型ドメインモデリング
TypeScript で関数型ドメインモデリングを行う。class を使わず関数による実装を優先する。
代数的データでドメインをモデリングする。
出力例

```ts
type FetchResult<T, E> = {
  ok: true;
  data: T
} | {
  ok: false;
  error: E
}
```

## TDDの実施
TDD を実施する。コードを生成するときは、それに対応するユニットテストを常に生成する。
コードを追加で修正したとき、`npm test` がパスすることを常に確認する。

```ts
function add(a: number, b: number) { return a + b }
test("1+2=3", () => {
  expect(add(1, 2)).toBe(3);
});
```

## Unit Testing

vitestでユニットテストを書く。
テストファイルは、実装コードと同階層に `{実装ファイル名}.test.{実装ファイルと同一の拡張子}` のようなファイル名で配置する。
