"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { clearSessionUser, setSessionUser } from "@/lib/session";

export type SessionUser = {
    id: string;
    name: string | null;
    picture: string | null;
    role: string;
};

type LineProfile = {
    userId: string;
    displayName: string;
    pictureUrl?: string;
};

export async function loginWithLine(
    accessToken: string,
): Promise<SessionUser> {
    const res = await fetch("https://api.line.me/v2/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error("Invalid LINE access token");
    }
    const profile = (await res.json()) as LineProfile;

    const user = await prisma.user.upsert({
        where: { id: profile.userId },
        create: {
            id: profile.userId,
            name: profile.displayName,
            picture: profile.pictureUrl ?? null,
        },
        update: {
            name: profile.displayName,
            picture: profile.pictureUrl ?? null,
        },
    });

    const sessionUser: SessionUser = {
        id: user.id,
        name: user.name,
        picture: user.picture,
        role: user.role,
    };
    await setSessionUser(sessionUser);
    return sessionUser;
}

export async function logout() {
    await clearSessionUser();
    redirect("/");
}
