"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/guard";
import { toFileUrl } from "@/lib/file";
import { FORBIDDEN, fail, type ActionResult } from "@/lib/action";
import { baht } from "@/lib/format";
import { roundMoney } from "@/lib/interest";
import { adjustLoanBalance } from "@/lib/loan-balance";
import {
    deleteLoanImage,
    uploadLoanImage,
} from "@/app/(main)/manage/loans/lib/loan-image";
import { parseLoanForm } from "@/app/actions/loans/loan.parsers";
import type {
    Frequency,
    InterestMethod,
    LoanItem,
} from "@/app/actions/loans/loan.types";

export async function listLoans(): Promise<LoanItem[]> {
    if (!(await isAdmin())) return [];

    const loans = await prisma.loan.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    debts: {
                        where: { installmentItems: { some: { paid: false } } },
                    },
                },
            },
        },
    });

    return loans.map((l) => ({
        id: l.id,
        name: l.name,
        imageUrl: l.imageUrl && toFileUrl(l.imageUrl),
        minAmount: l.minAmount,
        maxAmount: l.maxAmount,
        availableAmount: l.availableAmount,
        frequency: l.frequency as Frequency,
        interestMethod: l.interestMethod as InterestMethod,
        interestRate: l.interestRate,
        installments: l.installments,
        active: l.active,
        openDebtCount: l._count.debts,
    }));
}

export async function createLoan(formData: FormData): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;

    const parsed = parseLoanForm(formData);
    if (!parsed.ok) return parsed;

    const { image, ...fields } = parsed.data;

    try {
        const imageUrl = image ? await uploadLoanImage(image) : null;
        await prisma.loan.create({
            data: { ...fields, imageUrl, availableAmount: fields.maxAmount },
        });

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

        const uploaded = image ? await uploadLoanImage(image) : null;
        const imageUrl = uploaded ?? existing.imageUrl;

        try {
            await prisma.$transaction(async (tx) => {
                await adjustLoanBalance(
                    tx,
                    id,
                    fields.maxAmount - existing.maxAmount,
                    (available) =>
                        `จำนวนเงินสูงสุดต้องไม่น้อยกว่ายอดที่ถูกเบิกไปแล้ว (${baht(roundMoney(existing.maxAmount - available))})`,
                );

                await tx.loan.update({
                    where: { id },
                    data: { ...fields, imageUrl },
                });
            });
        } catch (e) {
            if (uploaded) await deleteLoanImage(uploaded);
            throw e;
        }

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
        const existing = await prisma.loan.findUnique({
            where: { id },
            include: {
                _count: { select: { debts: true, loanApplications: true } },
            },
        });
        if (!existing) return { ok: false, error: "Loan not found" };

        if (existing._count.debts > 0 || existing._count.loanApplications > 0)
            return {
                ok: false,
                error: "ไม่สามารถลบได้ เนื่องจากมีลูกหนี้หรือคำขอกู้ที่ใช้สินเชื่อนี้อยู่ ให้ปิดใช้งานแทน",
            };
        await prisma.loan.delete({ where: { id } });

        if (existing.imageUrl) await deleteLoanImage(existing.imageUrl);

        revalidatePath("/manage/loans");
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}
