import {
    Banknote,
    Landmark,
    Plus,
    ReceiptText,
    Settings,
    Users,
} from "lucide-react";
import type { NavItem } from "./nav-group";

export const managementMenu: NavItem[] = [
    {
        title: "ลูกหนี้",
        url: "/manage/debtors",
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

export const userMenu: NavItem[] = [
    {
        title: "หนี้ของฉัน",
        url: "/home",
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
