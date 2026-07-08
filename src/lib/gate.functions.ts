import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type GateSession = { unlocked?: boolean };

function getSessionConfig() {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET is not set or too short");
  }
  return {
    password,
    name: "cbr-pricing-gate",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const checkPricingUnlocked = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useSession<GateSession>(getSessionConfig());
    return { unlocked: !!session.data.unlocked };
  },
);

export const unlockPricing = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env.SITE_PASSWORD;
    if (!expected) throw new Error("SITE_PASSWORD is not set");
    const input = (data.code ?? "").trim();
    if (!input) return { ok: false as const };
    if (!passwordMatches(input, expected)) {
      return { ok: false as const };
    }
    const session = await useSession<GateSession>(getSessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockPricing = createServerFn({ method: "POST" }).handler(
  async () => {
    const session = await useSession<GateSession>(getSessionConfig());
    await session.clear();
    return { ok: true as const };
  },
);
