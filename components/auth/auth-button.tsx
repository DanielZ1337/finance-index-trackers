import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Github } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthButton() {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return <Button disabled>Loading...</Button>;
    }

    if (!session) {
        return (
            <div className="flex gap-2">
                <Button
                    onClick={() => signIn.social({
                        provider: "github",
                    })}
                    variant="outline"
                    size="sm"
                >
                    <Github className="mr-2 h-4 w-4" />
                    Sign in with GitHub
                </Button>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    {session.user.name || session.user.email}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-600 focus:text-red-600"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
