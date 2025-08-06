import { createAuthClient } from "better-auth/react";
import { multiSessionClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    plugins: [
        multiSessionClient(),
    ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
