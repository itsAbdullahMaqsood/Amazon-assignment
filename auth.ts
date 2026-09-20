import NextAuth from "next-auth";

// Providers are added in the authentication prompt. The callbacks below are what
// put the Mongo user id on the session, which every /api/user/* handler reads.
export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [],
    session: { strategy: "jwt" },
    callbacks: {
        jwt: async ({ token, user }: any) => {
            if (user) {
                token.sub = user.id || token.sub;
                token.role = user.role || token.role;
            }
            return token;
        },
        session: async ({ session, token }: any) => {
            if (session.user) {
                session.user.id = token.sub;
                session.user.role = token.role;
            }
            return session;
        },
    },
});
