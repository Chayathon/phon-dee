import "server-only";

const PUSH_URL = "https://api.line.me/v2/bot/message/push";

import type { LineFlexMessage } from "@/lib/line-flex";

export * from "@/lib/line-flex";

export type LineTextMessage = { type: "text"; text: string };
export type LineMessage = LineTextMessage | LineFlexMessage;

export type PushResult =
    | { ok: true; requestId: string | null }
    | { ok: false; status: number; error: string };

function getAccessToken() {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
    return token;
}

export async function pushMessage(
    to: string,
    messages: LineMessage[],
): Promise<PushResult> {
    let res: Response;
    try {
        res = await fetch(PUSH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAccessToken()}`,
            },
            body: JSON.stringify({ to, messages }),
            cache: "no-store",
        });
    } catch (e) {
        return {
            ok: false,
            status: 0,
            error: e instanceof Error ? e.message : "Network error",
        };
    }

    if (res.ok) {
        return { ok: true, requestId: res.headers.get("x-line-request-id") };
    }

    const data = (await res.json().catch(() => null)) as {
        message?: string;
    } | null;
    return {
        ok: false,
        status: res.status,
        error: data?.message ?? `LINE API error ${res.status}`,
    };
}
