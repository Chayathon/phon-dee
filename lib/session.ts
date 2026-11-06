import "server-only";
import { cookies } from "next/headers";
import type { SessionUser } from "@/app/actions/auth";

const COOKIE = "phondee_user";
const MAX_AGE = 60 * 60 * 24 * 7;

export async function setSessionUser(user: SessionUser) {
    const store = await cookies();
    store.set(COOKIE, JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE,
    });
}

export async function getSessionUser(): Promise<SessionUser | null> {
    const raw = (await cookies()).get(COOKIE)?.value;
    if (!raw) return null;
    try {
        return JSON.parse(raw) as SessionUser;
    } catch {
        return null;
    }
}
