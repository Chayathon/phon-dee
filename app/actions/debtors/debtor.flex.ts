import { baht, thaiDate, thaiMonth } from "@/lib/format";
import {
    flexMessage,
    type FlexBox,
    type LineFlexMessage,
} from "@/lib/line-flex";

export type DueStatus = "OVERDUE" | "TODAY" | "MONTHLY" | "UPCOMING";

type ReminderInput = {
    userName: string | null;
    loanName: string | null;
    installmentNo: number;
    installmentCount: number;
    amount: number;
    dueIso: string;
    status: DueStatus;
};

const STATUS_STYLE: Record<DueStatus, { color: string; label: string }> = {
    OVERDUE: { color: "#E5484D", label: "เลยกำหนดชำระ" },
    TODAY: { color: "#F5A524", label: "ครบกำหนดวันนี้" },
    MONTHLY: { color: "#0091FF", label: "แจ้งยอดประจำเดือน" },
    UPCOMING: { color: "#06C755", label: "ใกล้ครบกำหนด" },
};

function row(label: string, value: string): FlexBox {
    return {
        type: "box",
        layout: "horizontal",
        contents: [
            {
                type: "text",
                text: label,
                size: "sm",
                color: "#8C8C8C",
                flex: 2,
            },
            {
                type: "text",
                text: value,
                size: "sm",
                color: "#111111",
                flex: 3,
                align: "end",
                wrap: true,
            },
        ],
    };
}

export function reminderMessage(input: ReminderInput): LineFlexMessage {
    const { color, label } = STATUS_STYLE[input.status];
    const dueDate = thaiDate(input.dueIso);
    const monthly = input.status === "MONTHLY";

    const title = monthly
        ? `ค่างวดประจำเดือน ${thaiMonth(input.dueIso)}`
        : "แจ้งเตือนการชำระค่างวด";

    const note =
        input.status === "OVERDUE"
            ? "กรุณาชำระโดยเร็วที่สุด"
            : input.status === "TODAY"
              ? "กรุณาชำระภายในวันนี้"
              : `กรุณาชำระภายในวันที่ ${dueDate}`;

    return flexMessage(
        monthly
            ? `${title} ${baht(input.amount)} ครบกำหนด ${dueDate}`
            : `แจ้งเตือนค่างวด ${baht(input.amount)} ครบกำหนด ${dueDate}`,
        {
            type: "bubble",
            header: {
                type: "box",
                layout: "vertical",
                backgroundColor: color,
                paddingAll: "16px",
                contents: [
                    {
                        type: "text",
                        text: title,
                        wrap: true,
                        color: "#FFFFFF",
                        weight: "bold",
                        size: "md",
                    },
                    {
                        type: "text",
                        text: label,
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
                    {
                        type: "text",
                        text: `คุณ ${input.userName}`,
                        size: "sm",
                        color: "#555555",
                        wrap: true,
                    },
                    {
                        type: "text",
                        text: "ยอดชำระ",
                        size: "xs",
                        color: "#8C8C8C",
                        margin: "lg",
                    },
                    {
                        type: "text",
                        text: baht(input.amount),
                        size: "xxl",
                        weight: "bold",
                        color: "#111111",
                    },
                    { type: "separator", margin: "lg" },
                    {
                        type: "box",
                        layout: "vertical",
                        spacing: "sm",
                        margin: "lg",
                        contents: [
                            row("สินเชื่อ", input.loanName ?? "-"),
                            row(
                                "งวดที่",
                                `${input.installmentNo}/${input.installmentCount}`,
                            ),
                            row("ครบกำหนด", dueDate),
                        ],
                    },
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
