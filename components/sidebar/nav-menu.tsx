import {
    Banknote,
    Landmark,
    Plus,
    ReceiptText,
    Settings,
    Users,
} from "lucide-react";

export const managementMenu = [
    {
        title: "ลูกหนี้",
        url: "#",
        icon: Users,
    },
    {
        title: "สินเชื่อ",
        url: "/manage/loans",
        icon: Landmark,
    },
    {
        title: "ตั้งค่า",
        url: "#",
        icon: Settings,
    },
];

export const userMenu = [
    {
        title: "หนี้ของฉัน",
        url: "#",
        icon: Banknote,
    },
    {
        title: "เบิกสินเชื่อ",
        url: "#",
        icon: Plus,
    },
    {
        title: "คำขอของฉัน",
        url: "#",
        icon: ReceiptText,
    },
];
