const tokyoDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 日本時間での日付を 'YYYY-MM-DD' で返す(read_date の初期値に使う) */
export function todayInTokyo(now: Date = new Date()): string {
  return tokyoDateFormat.format(now);
}
