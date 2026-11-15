import { defineConfig } from "drizzle-kit";

// マイグレーションの生成だけに使う(適用は wrangler d1 migrations apply)
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/shared/db/schema.ts",
  out: "./migrations",
});
