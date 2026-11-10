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

// A LIFF ID is "<channelId>-<suffix>", so the LINE Login channel ID is its prefix.
function getChannelId() {
    const channelId = process.env.NEXT_PUBLIC_LIFF_ID?.split("-")[0];
    if (!channelId) throw new Error("NEXT_PUBLIC_LIFF_ID is not set");
    return channelId;
}

async function verifyLineToken(accessToken: string) {
    const res = await fetch(
        `https://api.line.me/oauth2/v2.1/verify?access_token=${encodeURIComponent(accessToken)}`,
        { cache: "no-store" },
    );
    if (!res.ok) {
        throw new Error("Invalid LINE access token");
    }
    const info = (await res.json()) as {
        client_id: string;
        expires_in: number;
    };
    if (info.client_id !== getChannelId() || info.expires_in <= 0) {
        throw new Error("Invalid LINE access token");
    }
}

export async function loginWithLine(
    accessToken: string,
): Promise<SessionUser> {
    await verifyLineToken(accessToken);

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
