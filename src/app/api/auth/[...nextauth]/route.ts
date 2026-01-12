import { handlers } from '@/lib/auth';

console.log("🔍 AUTH ROUTE - Environment Variables Check:", {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "Defined" : "Undefined",
    AUTH_URL: process.env.AUTH_URL ? "Defined" : "Undefined",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Defined" : "Undefined",
    AUTH_SECRET: process.env.AUTH_SECRET ? "Defined" : "Undefined",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Defined" : "Undefined",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "Defined" : "Undefined",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    NODE_ENV: process.env.NODE_ENV
});

export const { GET, POST } = handlers;
