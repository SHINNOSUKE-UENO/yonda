import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";
import { describe, expect, it } from "vitest";
import { isValidAccessToken } from "./verify";

const issuer = "https://example.cloudflareaccess.com";
const audience = "aud-tag";

// Access の公開鍵(JWKS)の代わりに、テスト用の鍵ペアを作る
const { privateKey, publicKey } = await generateKeyPair("RS256");
const keys = createLocalJWKSet({
  keys: [{ ...(await exportJWK(publicKey)), kid: "k1", alg: "RS256" }],
});

const sign = (aud: string) =>
  new SignJWT({ email: "me@example.com" })
    .setProtectedHeader({ alg: "RS256", kid: "k1" })
    .setIssuer(issuer)
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

describe("isValidAccessToken", () => {
  it("正しい署名・発行元・対象アプリのトークンは通す", async () => {
    expect(await isValidAccessToken(await sign(audience), { issuer, audience, keys })).toBe(true);
  });

  it("別のアプリ向けのトークンやトークンなしは拒否する", async () => {
    expect(await isValidAccessToken(await sign("other-app"), { issuer, audience, keys })).toBe(
      false,
    );
    expect(await isValidAccessToken(undefined, { issuer, audience, keys })).toBe(false);
  });
});
