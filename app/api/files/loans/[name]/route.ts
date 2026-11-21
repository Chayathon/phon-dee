import { getLoanImage } from "@/app/(main)/manage/loans/lib/loan-image";

export async function GET(
    _request: Request,
    { params }: RouteContext<"/api/files/loans/[name]">,
) {
    const { name } = await params;
    const file = await getLoanImage(name);

    if (!file) return new Response("Not found", { status: 404 });

    return new Response(file.body.transformToWebStream(), {
        headers: {
            "Content-Type": file.contentType ?? "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
