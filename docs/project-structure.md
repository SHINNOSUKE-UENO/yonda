# 読書記録アプリ プロジェクト構成設計

> 本書は暫定版。実装中に変更する可能性がある。画面仕様は `wireframe-spec.md` を参照。

## 0. 前提(決定事項)

| 項目 | 決定 |
|---|---|
| 目的 | 自分専用(リポジトリは公開、シークレットは漏らさない) |
| 形式 | PWA |
| フロント・実行 | TanStack Start + Cloudflare Workers |
| 一覧 | TanStack Table(カード表示、ソート: 読了日・著者・登録日) |
| UI | Chakra UI v3、シンプル、アクセントはオレンジ、ライト/ダーク手動切替 |
| 認証 | Cloudflare Access |
| DB | Cloudflare D1(`read_date` は必須、初期値は登録日) |
| 外部 API | Google Books API(サーバー経由、10 件ずつ取得) |
| オフライン | 登録済みの本の閲覧のみ。表紙画像は Cache First |
| 画面 | 本棚 / 検索 / 本の詳細・編集 |

---

## 1. 設計思想

3 つの考え方を組み合わせる。

| 考え方 | 該当箇所 | 内容 |
|---|---|---|
| 機能単位の分割(Feature-based) | `features/*` | 画面・機能ごとにロジックをまとめ、変更の影響範囲を閉じる |
| 見た目とロジックの分離 | `components/` と `features/*/use*.ts` | Container/Presentational の考え方を、カスタムフックで置き換えた形 |
| レイヤードアーキテクチャ | `server/*` | 依存を一方向にし、SQL と外部 API を末端に閉じ込める |

フロント側の役割分担:

| 層 | 役割 | Container/Presentational との対応 |
|---|---|---|
| `routes/` | フックを呼び、結果を表示用コンポーネントに渡す(薄く保つ) | Container |
| `features/` | 状態・ロジック(カスタムフック) | Container のロジック部分 |
| `components/` | props だけで描画する | Presentational |

---

## 2. ディレクトリ構成

```
.
├─ src/
│  ├─ routes/                  # 画面(TanStack Router のファイルルーティング)
│  │  ├─ __root.tsx            # Chakra Provider、ヘッダー、タブバー、オフラインバナー
│  │  ├─ index.tsx             # 画面1 本棚
│  │  ├─ search.tsx            # 画面2 検索
│  │  └─ books.$id.tsx         # 画面3 詳細・編集
│  ├─ components/              # 見た目のみ(WF の C1〜C11 に対応)
│  │  ├─ layout/               # Header(C1)、TabBar(C2)、OfflineBanner(C3)
│  │  ├─ book/                 # BookCard(C4)、BookCardSkeleton
│  │  └─ common/               # ConfirmDialog(C8)、EmptyState(C10)、LoadMoreButton(C11)
│  ├─ features/                # 画面ごとの状態・ロジック
│  │  ├─ shelf/                # useShelfTable(TanStack Table)、sortOptions
│  │  ├─ search/               # useBookSearch(10件ずつ追加取得)
│  │  └─ book-detail/          # フォーム状態、バリデーション
│  ├─ server/                  # サーバー専用(クライアントから import しない)
│  │  ├─ functions/            # createServerFn(books.ts / search.ts)
│  │  ├─ db/                   # D1 アクセス層(SQL はここだけ)
│  │  ├─ google-books/         # API クライアント、レスポンス変換
│  │  └─ auth/                 # Access JWT 検証(middleware)
│  ├─ shared/                  # 両側で使う型・zod スキーマ・日付処理
│  ├─ theme/                   # Chakra v3 の system(セマンティックトークン)
│  └─ sw.ts                    # Service Worker(injectManifest 用)
├─ migrations/                 # D1 マイグレーション
├─ public/                     # PWA アイコン
├─ wrangler.jsonc
├─ .dev.vars.example
└─ vite.config.ts
```

### 2-1. サーバー側の依存方向

| 層 | 呼んでよい先 | 役割 |
|---|---|---|
| routes / features | server/functions、components、shared | 画面と状態 |
| server/functions | auth → db / google-books | 認証確認、入力検証(zod)、処理の振り分け |
| server/db | D1 のみ | SQL の集約 |
| server/google-books | 外部 API のみ | API キー付与、型変換 |

全サーバー関数の先頭で Access の検証を必ず通す(middleware として 1 か所に集約)。

### 2-2. 「さらに表示する」(C11)の分担

| 置き場所 | 担当 |
|---|---|
| `components/common/LoadMoreButton.tsx` | 見た目のみ。`status`(idle / loading / error / done)と `onClick` を受け取る。本棚・検索で共通 |
| `features/shelf/useShelfTable.ts` | 全件から表示件数を 10 ずつ増やす。300〜500ms 待つ |
| `features/search/useBookSearch.ts` | API から次の 10 件を取得。0 件が返ったら done |

---

## 3. 環境変数・シークレット

| 名前 | 種別 | ローカル | 本番 | Git |
|---|---|---|---|---|
| `GOOGLE_BOOKS_API_KEY` | secret | `.dev.vars` | `wrangler secret put` | 入れない |
| `CF_ACCESS_TEAM_DOMAIN` | var | `.dev.vars` | `wrangler.jsonc` の vars | 可 |
| `CF_ACCESS_AUD` | var | `.dev.vars` | `wrangler.jsonc` の vars | 可(秘密ではない) |
| `DEV_BYPASS_ACCESS` | var | `.dev.vars` のみ `true` | 設定しない | 入れない |
| `DB` | D1 binding | `--local` | `d1_databases` | `database_id` は可 |

`.gitignore`:

```
.dev.vars
.dev.vars.*
!.dev.vars.example
.wrangler/
dist/
node_modules/
```

運用ルール:

- シークレットは `server/` 配下でのみ参照する(`import { env } from "cloudflare:workers"`)。
- push 前のシークレットスキャン(gitleaks など)を pre-commit か CI に入れる。

---

## 4. D1

### 4-1. スキーマ

```sql
-- migrations/0001_create_books.sql
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
```

### 4-2. 方針

| 論点 | 決定 | 理由 |
|---|---|---|
| ソート・10件ずつ表示 | 全件取得し、クライアントの TanStack Table で処理 | 件数が少ない。オフライン閲覧にも全件が必要 |
| インデックス | `google_books_id` の UNIQUE のみ | ソートは DB で行わない |
| 日付 | `read_date` 初期値はサーバー側で Asia/Tokyo 基準 | UTC だと深夜帯にずれる |
| 著者順 | `Intl.Collator('ja')` | 読み仮名がないため漢字は五十音順にならない(制約として受容) |
| 登録済み判定 | 検索結果 ID を `WHERE google_books_id IN (...)` で照合し `registered` を付与 | — |

### 4-3. マイグレーション

| 操作 | コマンド |
|---|---|
| 作成 | `wrangler d1 migrations create DB create_books` |
| ローカル適用 | `wrangler d1 migrations apply DB --local` |
| 本番適用 | `wrangler d1 migrations apply DB --remote` |

---

## 5. PWA

| 対象 | 方式 | 補足 |
|---|---|---|
| SW の生成 | `injectManifest`(`src/sw.ts`) | SSR で `index.html` がないため。SW 本体は自前、プリキャッシュ一覧のみプラグインが注入 |
| 静的アセット | プリキャッシュ | — |
| 画面遷移(navigation) | NetworkFirst、失敗時はキャッシュ済み `/` | オフラインでもシェル表示 → クライアントルーティング |
| 本のデータ | TanStack Query + IndexedDB 永続化(`persistQueryClient`) | サーバー関数レスポンスの SW キャッシュは避ける |
| 表紙画像 | CacheFirst(`books.google.com` / `books.googleusercontent.com`) | `cacheableResponse: { statuses: [0, 200] }`、`expiration.maxEntries` |
| 検索・登録・編集 | キャッシュしない | `navigator.onLine` で C3 バナーと無効化を制御 |

※ オフライン時のシェル表示は早期に実機確認する。

---

## 6. Cloudflare Access

| 項目 | 設定 |
|---|---|
| 保護対象 | カスタムドメイン(または workers.dev)を Self-hosted アプリとして登録 |
| ポリシー | 自分のメールアドレスのみ Allow |
| プレビュー URL | `preview_urls: false`、または Access で保護 |
| サーバー検証 | `Cf-Access-Jwt-Assertion` を `jose` で検証。JWKS: `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`、`aud` を `CF_ACCESS_AUD` と照合 |
| ローカル開発 | `DEV_BYPASS_ACCESS=true` のときのみスキップ。未設定時は拒否 |
| manifest | `<link rel="manifest" crossorigin="use-credentials">` |
| セッション切れ | オンライン時に 302 / 401 を検知したら再読み込みを促すトースト |

---

## 7. 画面遷移の実装

基本は TanStack Router の `Link`。

| 遷移 | 手段 | 注意点 |
|---|---|---|
| タブバー | `Link` | `activeProps` で `accent` を適用 |
| 本棚カード → 詳細 | `Link` | `<Card.Root asChild><Link …/></Card.Root>` |
| 空状態「本を検索する」 | `<Button asChild><Link to="/search" /></Button>` | 見た目はボタン、実体はリンク |
| 詳細の戻る | `Link to="/"` | `history.back()` は使わない |
| 削除実行後 → 本棚 | `useNavigate()` | 処理完了後のプログラム遷移 |
| 検索結果カード | リンクにしない | 未登録の本に詳細がない。リンク内にボタンを入れ子にしない |

BookCard は「リンクにするかどうか」を props で切り替えられるようにする。

---

## 8. 着手順

| 順番 | 作業 |
|---|---|
| 1 | TanStack Start + Cloudflare の雛形、`wrangler.jsonc`、`.dev.vars.example` |
| 2 | D1 マイグレーション、db 層、サーバー関数(Access はバイパス) |
| 3 | Chakra のトークン・テーマ切替、共通コンポーネント C1〜C11 |
| 4 | 3 画面の実装(本棚 → 検索 → 詳細) |
| 5 | Access を本番に設定し、JWT 検証を有効化 |
| 6 | PWA(SW、IndexedDB 永続化、表紙キャッシュ)とオフライン確認 |
