import { isAdmin } from "@/lib/guard";
import { pushMessage, type LineMessage } from "@/lib/line";

export async function POST(request: Request) {
    if (!(await isAdmin())) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { to, messages } = (await request.json()) as {
        to: string;
        messages: LineMessage[];
    };

    const result = await pushMessage(to, messages);
    if (!result.ok) {
        const status = [400, 429].includes(result.status) ? result.status : 502;
        return Response.json({ error: result.error }, { status });
    }

    return Response.json({ requestId: result.requestId });
}
