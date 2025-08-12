import type { Context } from "hono";

export function keyGenerator(c: Context) {
  const userId = getClientIP(c) ?? "anonymous";

  // Bucket by route & method (normalize dynamic segments so /users/123 ~= /users/:id)
  const method = c.req.method.toUpperCase();
  const pathBucket = normalizePath(c.req.path);

  return `rl:${userId}:${method}:${pathBucket}`;
}

function getClientIP(c: Context): string | undefined {
  // Cloudflare / Fly.io / Fastly
  const cf = c.req.header("cf-connecting-ip");
  if (cf) return cf;

  // Proxies / Nginx / many CDNs
  const xff = c.req.header("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim();

  // Some setups (Railway, Render etc.)
  const real = c.req.header("x-real-ip");
  if (real) return real;

  return undefined;
}

function normalizePath(path: string): string {
  // Replace obvious IDs (numbers, UUIDs) with placeholders so keys don’t explode
  return path
    .split("/")
    .map((seg) => {
      if (!seg) return seg;
      // numeric id
      if (/^\d+$/.test(seg)) return ":id";
      // uuid v4-ish
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(seg))
        return ":uuid";
      // short base58/62 IDs etc.
      if (/^[A-Za-z0-9_-]{10,}$/.test(seg)) return ":token";
      return seg;
    })
    .join("/");
}
