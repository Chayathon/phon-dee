import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/app/actions/auth";

export const SESSION_COOKIE = "phondee_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getKey() {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("SESSION_SECRET must be set (at least 32 characters)");
    }
    return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser): Promise<string> {
    return new SignJWT({
        name: user.name,
        picture: user.picture,
        role: user.role,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(user.id)
        .setIssuedAt()
        .setExpirationTime(`${SESSION_MAX_AGE}s`)
        .sign(getKey());
}

export async function verifySession(
    token: string | undefined,
): Promise<SessionUser | null> {
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, getKey(), {
            algorithms: ["HS256"],
        });
        if (!payload.sub || typeof payload.role !== "string") return null;
        return {
            id: payload.sub,
            name: typeof payload.name === "string" ? payload.name : null,
            picture:
                typeof payload.picture === "string" ? payload.picture : null,
            role: payload.role,
        };
    } catch {
        return null;
    }
}
