export type ActionResult = { ok: true } | { ok: false; error: string };

export const FORBIDDEN: ActionResult = { ok: false, error: "Forbidden" };

export const fail = (e: unknown): ActionResult => ({
    ok: false,
    error: e instanceof Error ? e.message : "Something went wrong",
});
