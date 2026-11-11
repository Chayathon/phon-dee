import "server-only";
import { cookies } from "next/headers";
import type { SessionUser } from "@/app/actions/auth";
import {
    SESSION_COOKIE,
    SESSION_MAX_AGE,
    signSession,
    verifySession,
} from "@/lib/jwt";

export async function setSessionUser(user: SessionUser) {
    const store = await cookies();
    store.set(SESSION_COOKIE, await signSession(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    });
}

export async function getSessionUser(): Promise<SessionUser | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return verifySession(token);
}

export async function clearSessionUser() {
    (await cookies()).delete(SESSION_COOKIE);
}
