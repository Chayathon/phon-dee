"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/guard";
import { FORBIDDEN, fail, type ActionResult } from "@/lib/action";
import { calculateInstallment } from "@/lib/interest";
import { pushMessage } from "@/lib/line";
import { parseDebtorForm } from "@/app/actions/debtors/debtor.parsers";
import {
    reminderMessage,
    type DueStatus,
} from "@/app/actions/debtors/debtor.flex";
import type {
    DebtorFields,
    DebtorItem,
    UserOption,
} from "@/app/actions/debtors/debtor.types";
import type { Frequency, InterestMethod } from "@/app/actions/loans/loan.types";

const PATH = "/manage/debtors";
const DAY_MS = 24 * 60 * 60 * 1000;

type LoanTerms = {
    frequency: string;
    interestMethod: string;
    interestRate: number;
};

/** Dates are stored at UTC midnight so the calendar day never shifts with the server's timezone. */
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Due date of installment `i` (0-based), counted from the first due date.
 * Monthly dates are clamped to the end of shorter months (Jan 31 → Feb 28 → Mar 31).
 */
function dueDate(first: Date, i: number, frequency: Frequency): Date {
    if (frequency === "MONTHLY") {
        const y = first.getUTCFullYear();
        const m = first.getUTCMonth() + i;
        const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
        return new Date(Date.UTC(y, m, Math.min(first.getUTCDate(), lastDay)));
    }
    const days = (frequency === "WEEKLY" ? 7 : 14) * i;
    return new Date(first.getTime() + days * DAY_MS);
}

/** Installment rows for a debt, priced from the loan's terms. */
function buildSchedule(debtId: string, loan: LoanTerms, fields: DebtorFields) {
    const frequency = loan.frequency as Frequency;
    const { payment } = calculateInstallment({
        principal: fields.amount,
        annualRate: loan.interestRate,
        installments: fields.installments,
        frequency,
        method: loan.interestMethod as InterestMethod,
        roundUp: fields.roundUp,
    });
    const first = toDate(fields.firstDueDate);
    return Array.from({ length: fields.installments }, (_, i) => ({
        debtId,
        amount: payment,
        dueDate: dueDate(first, i, frequency),
    }));
}

export async function listUsers(): Promise<UserOption[]> {
    if (!(await isAdmin())) return [];

    return prisma.user.findMany({
        // where: { role: "USER" },
        select: { id: true, name: true, picture: true },
        orderBy: { name: "asc" },
    });
}

export async function listDebtors(): Promise<DebtorItem[]> {
    if (!(await isAdmin())) return [];

    const debts = await prisma.debt.findMany({
        orderBy: { createdAt: "desc" },
    });
    if (debts.length === 0) return [];

    // No Prisma relations, so join by hand.
    const [users, loans, installments] = await Promise.all([
        prisma.user.findMany({
            where: { id: { in: [...new Set(debts.map((d) => d.userId))] } },
            select: { id: true, name: true, picture: true },
        }),
        prisma.loan.findMany({
            where: { id: { in: [...new Set(debts.map((d) => d.loanId))] } },
            select: { id: true, name: true, frequency: true },
        }),
        prisma.installment.findMany({
            where: { debtId: { in: debts.map((d) => d.id) } },
            orderBy: { dueDate: "asc" },
        }),
    ]);

    const userById = new Map(users.map((u) => [u.id, u]));
    const loanById = new Map(loans.map((l) => [l.id, l]));
    const byDebt = Map.groupBy(installments, (i) => i.debtId);

    return debts.map((d) => {
        const user = userById.get(d.userId);
        const loan = loanById.get(d.loanId);
        const rows = byDebt.get(d.id) ?? [];
        const nextUnpaid = rows.find((r) => !r.paid);
        return {
            id: d.id,
            userId: d.userId,
            userName: user?.name ?? null,
            userPicture: user?.picture ?? null,
            loanId: d.loanId,
            loanName: loan?.name ?? "ไม่พบสินเชื่อ",
            frequency: (loan?.frequency ?? "MONTHLY") as Frequency,
            amount: d.amount,
            installments: d.installments,
            payment: rows[0]?.amount ?? 0,
            paidCount: rows.filter((r) => r.paid).length,
            firstDueDate: rows[0] ? toIso(rows[0].dueDate) : "",
            nextDueDate: nextUnpaid ? toIso(nextUnpaid.dueDate) : null,
        };
    });
}

export async function createDebtor(formData: FormData): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;

    const userId = String(formData.get("userId") ?? "");
    const loanId = String(formData.get("loanId") ?? "");

    try {
        const [user, loan] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.loan.findUnique({ where: { id: loanId } }),
        ]);
        if (!user) return { ok: false, error: "ไม่พบผู้ใช้งาน" };
        if (!loan || !loan.active)
            return {
                ok: false,
                error: "ไม่พบสินเชื่อหรือสินเชื่อถูกปิดใช้งาน",
            };

        // Re-validate on the server against the loan's real terms.
        const parsed = parseDebtorForm(formData, loan);
        if (!parsed.ok) return parsed;
        const fields = parsed.data;

        await prisma.$transaction(async (tx) => {
            const debt = await tx.debt.create({
                data: {
                    userId,
                    loanId,
                    amount: fields.amount,
                    installments: fields.installments,
                },
            });
            await tx.installment.createMany({
                data: buildSchedule(debt.id, loan, fields),
            });
        });

        revalidatePath(PATH);
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}

/**
 * Re-prices the debt and replaces its whole schedule. User and loan stay fixed,
 * and it is refused once any installment has been paid.
 */
export async function updateDebtor(
    id: string,
    formData: FormData,
): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;

    try {
        const debt = await prisma.debt.findUnique({ where: { id } });
        if (!debt) return { ok: false, error: "ไม่พบลูกหนี้" };

        const loan = await prisma.loan.findUnique({
            where: { id: debt.loanId },
        });
        if (!loan) return { ok: false, error: "ไม่พบสินเชื่อของลูกหนี้รายนี้" };

        const parsed = parseDebtorForm(formData, loan);
        if (!parsed.ok) return parsed;
        const fields = parsed.data;

        const paid = await prisma.$transaction(async (tx) => {
            // Checked inside the transaction so a payment recorded meanwhile isn't wiped.
            const paidCount = await tx.installment.count({
                where: { debtId: id, paid: true },
            });
            if (paidCount > 0) return paidCount;

            await tx.debt.update({
                where: { id },
                data: {
                    amount: fields.amount,
                    installments: fields.installments,
                },
            });
            await tx.installment.deleteMany({ where: { debtId: id } });
            await tx.installment.createMany({
                data: buildSchedule(id, loan, fields),
            });
            return 0;
        });
        if (paid > 0)
            return {
                ok: false,
                error: "ไม่สามารถแก้ไขได้ เนื่องจากมีการชำระงวดแล้ว",
            };

        revalidatePath(PATH);
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}

/**
 * Reminder status for an installment, from ISO dates (YYYY-MM-DD).
 * On the 1st of a month, an installment due later that month gets the
 * start-of-month notice (MONTHLY) instead of a plain UPCOMING reminder.
 */
function dueStatus(dueIso: string, todayIso: string): DueStatus {
    if (dueIso < todayIso) return "OVERDUE";
    if (dueIso === todayIso) return "TODAY";
    const isFirstOfMonth = todayIso.endsWith("-01");
    const sameMonth = dueIso.slice(0, 7) === todayIso.slice(0, 7);
    return isFirstOfMonth && sameMonth ? "MONTHLY" : "UPCOMING";
}

/** Sends the debtor a LINE reminder for their earliest unpaid installment. */
export async function remindDebtor(id: string): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;

    try {
        const debt = await prisma.debt.findUnique({ where: { id } });
        if (!debt) return { ok: false, error: "ไม่พบลูกหนี้" };

        const [user, loan, installments] = await Promise.all([
            prisma.user.findUnique({
                where: { id: debt.userId },
                select: { name: true },
            }),
            prisma.loan.findUnique({
                where: { id: debt.loanId },
                select: { name: true },
            }),
            prisma.installment.findMany({
                where: { debtId: id },
                orderBy: { dueDate: "asc" },
            }),
        ]);

        const index = installments.findIndex((i) => !i.paid);
        if (index === -1) return { ok: false, error: "ชำระครบทุกงวดแล้ว" };
        const due = installments[index];

        const dueIso = toIso(due.dueDate);
        // Due dates are calendar days, so compare against today's date in Thailand.
        const todayIso = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Bangkok",
        });
        const status = dueStatus(dueIso, todayIso);

        const message = reminderMessage({
            userName: user?.name ?? null,
            loanName: loan?.name ?? null,
            installmentNo: index + 1,
            installmentCount: installments.length,
            amount: due.amount,
            dueIso,
            status,
        });

        const res = await pushMessage(debt.userId, [message]);
        return res.ok ? { ok: true } : { ok: false, error: res.error };
    } catch (e) {
        return fail(e);
    }
}

export async function deleteDebtor(id: string): Promise<ActionResult> {
    if (!(await isAdmin())) return FORBIDDEN;

    try {
        const debt = await prisma.debt.findUnique({ where: { id } });
        if (!debt) return { ok: false, error: "ไม่พบลูกหนี้" };

        await prisma.$transaction([
            prisma.installment.deleteMany({ where: { debtId: id } }),
            prisma.debt.delete({ where: { id } }),
        ]);

        revalidatePath(PATH);
        return { ok: true };
    } catch (e) {
        return fail(e);
    }
}
