import { readdirSync, readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getPlatformProxy } from "wrangler";
import { findRegisteredGoogleBooksIds, registerBook } from "./books";

let proxy: Awaited<ReturnType<typeof getPlatformProxy<Env>>>;
let db: D1Database;

beforeAll(async () => {
  // メモリ上のローカル D1 に、本番と同じマイグレーションを当てる
  proxy = await getPlatformProxy<Env>({ persist: false });
  db = proxy.env.DB;
  const files = readdirSync("migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const statements = readFileSync(`migrations/${file}`, "utf8").split("--> statement-breakpoint");
    await db.batch(statements.map((sql) => db.prepare(sql)));
  }
});

afterAll(async () => {
  await proxy.dispose();
});

beforeEach(async () => {
  await db.prepare("DELETE FROM books").run();
});

const input = {
  googleBooksId: "gb-1",
  title: "吾輩は猫である",
  authors: "夏目漱石",
  thumbnailUrl: null,
};

describe("registerBook", () => {
  it("読了日の初期値は日本時間の登録日になる", async () => {
    // UTC 2026-10-14 15:30 = JST 2026-10-15 00:30
    const book = await registerBook(db, input, new Date("2026-10-14T15:30:00Z"));
    expect(book.readDate).toBe("2026-10-15");
  });

  it("同じ google_books_id は二重に登録できない", async () => {
    await registerBook(db, input);
    await expect(registerBook(db, input)).rejects.toThrow();
  });
});

describe("findRegisteredGoogleBooksIds", () => {
  it("渡した ID のうち登録済みのものだけを返す", async () => {
    await registerBook(db, input);
    expect(await findRegisteredGoogleBooksIds(db, ["gb-1", "gb-2"])).toEqual(["gb-1"]);
  });
});
