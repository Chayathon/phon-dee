"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function LogoutButton() {
    const [pending, startTransition] = useTransition();

    function handleLogout() {
        startTransition(async () => {
            try {
                const { default: liff } = await import("@line/liff");
                await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
                if (liff.isLoggedIn()) liff.logout();
            } finally {
                await logout();
            }
        });
    }

    return (
        <Button variant="destructive" onClick={handleLogout} disabled={pending}>
            {pending ? (
                <Spinner data-icon="inline-start" />
            ) : (
                <LogOut data-icon="inline-start" />
            )}
            Logout
        </Button>
    );
}
