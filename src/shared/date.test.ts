import { describe, expect, it } from "vitest";
import { todayInTokyo } from "./date";

describe("todayInTokyo", () => {
  it("UTC では前日でも、日本時間の日付を YYYY-MM-DD で返す", () => {
    // UTC 2026-10-14 15:30 = JST 2026-10-15 00:30
    expect(todayInTokyo(new Date("2026-10-14T15:30:00Z"))).toBe("2026-10-15");
  });
});
