-- Migration number: 0001 	 2026-11-04T13:09:28.415Z
CREATE TABLE books (
  id              TEXT PRIMARY KEY,          -- crypto.randomUUID()
  google_books_id TEXT NOT NULL UNIQUE,      -- 二重登録防止・「登録済み」判定
  title           TEXT NOT NULL,
  authors         TEXT NOT NULL DEFAULT '',  -- 「、」区切りの表示用文字列
  thumbnail_url   TEXT,                      -- https に置換して保存
  read_date       TEXT NOT NULL,             -- 'YYYY-MM-DD'(初期値=登録日 JST)
  memo            TEXT NOT NULL DEFAULT '',
  created_at      TEXT NOT NULL,             -- ISO 8601
  updated_at      TEXT NOT NULL
);
