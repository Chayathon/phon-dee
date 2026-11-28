import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function LoanAvatar({
    name,
    imageUrl,
    className,
}: {
    name: string;
    imageUrl: string | null;
    className?: string;
}) {
    return (
        <Avatar
            className={cn("size-10 rounded-xl after:rounded-xl", className)}
        >
            {imageUrl && (
                <AvatarImage
                    src={imageUrl}
                    alt=""
                    className="rounded-xl object-cover"
                />
            )}
            <AvatarFallback className="rounded-xl font-semibold">
                {name.slice(0, 1)}
            </AvatarFallback>
        </Avatar>
    );
}
