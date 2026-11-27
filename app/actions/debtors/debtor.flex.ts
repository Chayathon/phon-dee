import { thaiDate } from "@/lib/date";
import { baht } from "@/lib/format";
import {
    flexMessage,
    type FlexBox,
    type LineFlexMessage,
} from "@/lib/line-flex";
import type { DueStatus } from "@/app/actions/debtors/debtor.due";

export type ReminderItem = {
    loanName: string | null;
    borrowed: number;
    installmentNo: number;
    installmentCount: number;
    amount: number;
    dueIso: string;
    status: DueStatus | null;
};

const STATUS_STYLE: Record<DueStatus, { color: string; label: string }> = {
    OVERDUE: { color: "#E5484D", label: "เลยกำหนดชำระ" },
    TODAY: { color: "#F5A524", label: "ครบกำหนดวันนี้" },
};

const DEFAULT_COLOR = "#06C755";

const SEVERITY: DueStatus[] = ["OVERDUE", "TODAY"];

const MAX_ROWS = 12;

function itemRow(item: ReminderItem): FlexBox {
    const style = item.status ? STATUS_STYLE[item.status] : null;
    return {
        type: "box",
        layout: "horizontal",
        spacing: "md",
        contents: [
            {
                type: "box",
                layout: "vertical",
                flex: 3,
                spacing: "xs",
                contents: [
                    // Primary: amount withdrawn on the debt.
                    {
                        type: "text",
                        text: `${baht(item.borrowed)}`,
                        size: "md",
                        weight: "bold",
                        color: "#111111",
                        wrap: true,
                    },
                    // Loan and installment share one weight.
                    {
                        type: "text",
                        text: `${item.loanName ?? "-"} · งวด ${item.installmentNo}/${item.installmentCount}`,
                        size: "xs",
                        color: "#555555",
                        wrap: true,
                    },
                    {
                        type: "text",
                        text: style
                            ? `${thaiDate(item.dueIso)} · ${style.label}`
                            : `${thaiDate(item.dueIso)}`,
                        size: "xs",
                        weight: "bold",
                        color: style?.color ?? "#555555",
                        wrap: true,
                    },
                ],
            },
            // Right: what this installment costs.
            {
                type: "box",
                layout: "vertical",
                flex: 2,
                justifyContent: "center",
                contents: [
                    {
                        type: "text",
                        text: baht(item.amount),
                        size: "lg",
                        weight: "bold",
                        color: "#111111",
                        align: "end",
                        wrap: true,
                    },
                ],
            },
        ],
    };
}

export function summaryMessage(input: {
    userName: string | null;
    items: ReminderItem[];
    total: number;
}): LineFlexMessage {
    const { items, total } = input;
    const worst = SEVERITY.find((s) => items.some((i) => i.status === s));
    const color = worst ? STATUS_STYLE[worst].color : DEFAULT_COLOR;
    const overdue = items.filter((i) => i.status === "OVERDUE").length;
    const dueToday = items.filter((i) => i.status === "TODAY").length;
    const shown = items.slice(0, MAX_ROWS);
    const hidden = items.length - shown.length;

    const note =
        worst === "OVERDUE"
            ? "มีงวดที่เลยกำหนด กรุณาชำระโดยเร็วที่สุด"
            : worst === "TODAY"
              ? "มีงวดที่ครบกำหนด กรุณาชำระภายในวันนี้"
              : "กรุณาชำระภายในวันที่ครบกำหนด";

    return flexMessage(
        // Alt text is used in notifications and when the message cannot be displayed.
        `สรุปยอดค่างวด ${items.length} รายการ รวม ${baht(total)}`,
        {
            type: "bubble",
            header: {
                type: "box",
                layout: "vertical",
                backgroundColor: color,
                paddingAll: "16px",
                contents: [
                    // Header: summary of the number of items and their status.
                    {
                        type: "text",
                        text: "สรุปยอดค่างวดที่ต้องชำระ",
                        wrap: true,
                        color: "#FFFFFF",
                        weight: "bold",
                        size: "md",
                    },
                    // Subheader: number of items and their status.
                    {
                        type: "text",
                        text: [
                            `${items.length} รายการ`,
                            overdue > 0 && `เลยกำหนด ${overdue} งวด`,
                            dueToday > 0 && `ครบกำหนดวันนี้ ${dueToday} งวด`,
                        ]
                            .filter(Boolean)
                            .join(" · "),
                        wrap: true,
                        color: "#FFFFFF",
                        size: "xs",
                        margin: "sm",
                    },
                ],
            },
            body: {
                type: "box",
                layout: "vertical",
                spacing: "md",
                paddingAll: "16px",
                contents: [
                    // Body: user information and the list of due installments.
                    {
                        type: "text",
                        text: `คุณ ${input.userName ?? ""}`,
                        size: "sm",
                        color: "#555555",
                        wrap: true,
                    },
                    // Total amount due.
                    {
                        type: "text",
                        text: "ยอดชำระรวม",
                        size: "xs",
                        color: "#8C8C8C",
                        margin: "lg",
                    },
                    {
                        type: "text",
                        text: baht(total),
                        size: "xxl",
                        weight: "bold",
                        color: "#111111",
                    },
                    { type: "separator", margin: "lg" },

                    // List of due installments, with a maximum number of rows shown.
                    {
                        type: "box",
                        layout: "vertical",
                        spacing: "md",
                        margin: "lg",
                        contents: [
                            ...shown.map(itemRow),
                            ...(hidden > 0
                                ? [
                                      {
                                          type: "text",
                                          text: `และอีก ${hidden} รายการ`,
                                          size: "xs",
                                          color: "#8C8C8C",
                                      } as const,
                                  ]
                                : []),
                        ],
                    },
                    { type: "separator", margin: "lg" },

                    // Footer: total amount and a note about the due installments.
                    {
                        type: "box",
                        layout: "horizontal",
                        margin: "lg",
                        contents: [
                            {
                                type: "text",
                                text: "รวมทั้งหมด",
                                size: "lg",
                                weight: "bold",
                                color: "#111111",
                            },
                            {
                                type: "text",
                                text: baht(total),
                                size: "lg",
                                weight: "bold",
                                color,
                                align: "end",
                            },
                        ],
                    },
                    // Note: a message about the due installments, based on their status.
                    {
                        type: "text",
                        text: note,
                        size: "sm",
                        color,
                        weight: "bold",
                        wrap: true,
                        margin: "lg",
                    },
                ],
            },
        },
    );
}
