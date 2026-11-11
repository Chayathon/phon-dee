"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/guard";
import { FORBIDDEN, fail, type ActionResult } from "@/lib/action";
import {
    deleteLoanImage,
    uploadLoanImage,
} from "@/app/(main)/manage/loans/lib/loan-image";
import { parseLoanForm } from "@/app/actions/loans/loan.parsers";
import type { Frequency, LoanItem } from "@/app/actions/loans/loan.types";

export async function listLoans(): Promise<LoanItem[]> {
    if (!(await isAdmin())) return [];

    const loans = await prisma.loan.findMany({
        orderBy: { createdAt: "desc" },
    });

    return loans.map((l) => ({
        id: l.id,
        name: l.name,
        imageUrl: l.imageUrl,
        minAmount: l.minAmount,
        maxAmount: l.maxAmount,
        frequency: l.frequency as Frequency,
        installments: l.installments,
        active: l.active,
    }));
}

export async function createLoan(formData: FormData): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;

    const parsed = parseLoanForm(formData);
    if (!parsed.ok) return parsed;

    const { image, ...fields } = parsed.data;

    try {
        const imageUrl = image ? await uploadLoanImage(image) : null;
        await prisma.loan.create({ data: { ...fields, imageUrl } });
        revalidatePath("/manage/loans");
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}

export async function updateLoan(
    id: string,
    formData: FormData,
): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;
    const parsed = parseLoanForm(formData);
    if (!parsed.ok) return parsed;
    const { image, ...fields } = parsed.data;
    try {
        const existing = await prisma.loan.findUnique({ where: { id } });
        if (!existing) return { ok: false, error: "Loan not found" };
        const imageUrl = image
            ? await uploadLoanImage(image)
            : existing.imageUrl;
        await prisma.loan.update({
            where: { id },
            data: { ...fields, imageUrl },
        });
        if (image && existing.imageUrl)
            await deleteLoanImage(existing.imageUrl);
        revalidatePath("/manage/loans");
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}

export async function setLoanActive(
    id: string,
    active: boolean,
): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;
    try {
        await prisma.loan.update({ where: { id }, data: { active } });
        revalidatePath("/manage/loans");
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}

export async function deleteLoan(id: string): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;
    try {
        const existing = await prisma.loan.findUnique({ where: { id } });
        if (!existing) return { ok: false, error: "Loan not found" };
        await prisma.loan.delete({ where: { id } });
        if (existing.imageUrl) await deleteLoanImage(existing.imageUrl);
        revalidatePath("/manage/loans");
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}
