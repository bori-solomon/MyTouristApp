import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

if (!secret) {
    console.error("❌ CRITICAL: No secret found for NextAuth. Please set AUTH_SECRET or NEXTAUTH_SECRET.");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    secret: secret,
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
    cookies: {
        pkceCodeVerifier: {
            name: 'next-auth.pkce.code_verifier',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
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
