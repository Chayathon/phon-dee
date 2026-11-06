"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithLine } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Status = "loading" | "error";

export function LiffLogin() {
    const router = useRouter();
    const [status, setStatus] = useState<Status>("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                const { default: liff } = await import("@line/liff");
                await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
                if (cancelled) return;

                if (!liff.isLoggedIn()) {
                    liff.login();
                    return;
                }

                const accessToken = liff.getAccessToken();
                if (!accessToken) throw new Error("Missing LINE access token");

                const user = await loginWithLine(accessToken);
                if (cancelled) return;

                router.replace(user.role === "ADMIN" ? "/manage" : "/home");
            } catch (e) {
                if (cancelled) return;
                setError(e instanceof Error ? e.message : "Login failed");
                setStatus("error");
            }
        }

        run();
        return () => {
            cancelled = true;
        };
    }, [router]);

    if (status === "error") {
        return (
            <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-destructive">{error}</p>
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                >
                    Try again
                </Button>
            </div>
        );
    }

    return <Spinner />;
}
