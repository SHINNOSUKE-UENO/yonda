# yonda

読破した本の情報と感想を残すWeb アプリ

## ローカル開発

```sh
pnpm install                                   # Git フック(lefthook)も自動で登録される
cp .dev.vars.example .dev.vars                 # 値を入れる
pnpm exec wrangler d1 migrations apply DB --local
pnpm dev
```

- コミット時に gitleaks が実行されるため、事前に `brew install gitleaks` が必要。

### データベース(D1)

- ローカルの DB は `.wrangler/state/` に保存される。
- `.wrangler/` を削除すると、ローカルの DB(登録した本のデータ)も消える。
  - 復旧するには、マイグレーションをもう一度適用する(テーブルは作り直されるが、データは戻らない)。
- テーブル定義は `src/shared/db/schema.ts`(Drizzle)を正とする。変更したら次の手順でマイグレーションを生成・適用する。
  1. `pnpm exec drizzle-kit generate --name <名前>` で `migrations/` に SQL を生成する(生成物はコミットする)。
  2. `pnpm exec wrangler d1 migrations apply DB --local` でローカルに適用する。
