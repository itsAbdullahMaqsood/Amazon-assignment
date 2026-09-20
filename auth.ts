import NextAuth from "next-auth";

// No providers/callbacks are configured yet — this mirrors the v4 setup, which
// also had none. Providers get added here as they are wired up.
export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [],
    session: { strategy: "jwt" },
});
