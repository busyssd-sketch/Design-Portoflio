const COOKIE_NAME = "portfolio_cms_session";
export { COOKIE_NAME };

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
function encodeBase64Url(bytes: ArrayBuffer) {
  const array = new Uint8Array(bytes);
  let binary = "";
  array.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
export async function verifyCmsSession(token: string, secret: string) {
  try {
    const [head, body, signature] = token.split(".");
    if (!head || !body || !signature) return false;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const expected = encodeBase64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${head}.${body}`)));
    if (expected !== signature) return false;
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(body))) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000);
  } catch { return false; }
}
