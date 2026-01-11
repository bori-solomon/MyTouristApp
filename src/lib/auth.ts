import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

console.log("DEBUG AUTH ENV:", {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_URL: process.env.AUTH_URL,
    TRUST_HOST: process.env.AUTH_TRUST_HOST,
    VERCEL_URL: process.env.VERCEL_URL
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Initial sign in
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : 0;
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < ((token.accessTokenExpires as number) || 0)) {
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.refreshToken = token.refreshToken as string;
            return session;
        },
    },
    pages: {
        signIn: '/',
    },
    secret: process.env.NEXTAUTH_SECRET,
});

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(token: any): Promise<any> {
    try {
        const url =
            'https://oauth2.googleapis.com/token?' +
            new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken as string,
            });

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error('Error refreshing access token', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

declare module 'next-auth' {
    interface Session {
        accessToken?: string;
        refreshToken?: string;
    }
}
