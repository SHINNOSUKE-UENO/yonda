import { type JWTVerifyGetKey, jwtVerify } from "jose";

type Options = {
  /** https://<team>.cloudflareaccess.com */
  issuer: string;
  /** Access アプリの AUD タグ */
  audience: string;
  /** 署名検証用の公開鍵(本番は Access の JWKS) */
  keys: JWTVerifyGetKey;
};

/** Cloudflare Access が付けた JWT の署名・発行元・対象アプリ・有効期限を確かめる */
export async function isValidAccessToken(
  token: string | undefined,
  { issuer, audience, keys }: Options,
): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, keys, { issuer, audience });
    return true;
  } catch {
    return false;
  }
}
