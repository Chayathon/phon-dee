import "server-only";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function hasRole(role: string) {
    const session = await getSessionUser();
    if (!session) return false;

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { role: true },
    });

    return user?.role === role;
}

export const isAdmin = () => hasRole("ADMIN");
