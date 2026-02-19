"use client";

import Link from "next/link";
import { Map, Plane, Languages, MoreVertical, LogOut, User, LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Locale } from "@/lib/dictionaries";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AuthButton } from "./AuthButton";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
    const { locale, setLocale, dict } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const languages: { code: Locale; label: string }[] = [
        { code: "en", label: "English" },
        { code: "ru", label: "Русский" },
        { code: "ua", label: "Українська" },
        { code: "ja", label: "日本語" },
    ];

    return (
        <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Plane className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent whitespace-nowrap">
                        {dict.nav.title}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded ml-1">v1.2</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden sm:flex items-center gap-4">
                    <AuthButton />
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                    >
                        <Languages className="w-4 h-4" />
                        <span className="uppercase">{locale}</span>
                    </button>
                    {isOpen && (
                        <>
                            <div className="absolute right-0 mt-12 w-40 bg-popover border border-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLocale(lang.code);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors",
                                            locale === lang.code ? "text-primary font-medium" : "text-muted-foreground"
                                        )}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        </>
                    )}
                </div>

                {/* Mobile Menu & Quick Actions */}
                <div className="sm:hidden flex items-center gap-2">
                    <AuthStatusAwareSignIn />

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
                    >
                        <MoreVertical className="w-6 h-6" />
                    </button>

                    {isOpen && (
                        <>
                            <div className="absolute right-4 top-16 w-64 bg-popover border border-border rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1 p-2">
                                {/* Mobile Auth & User Info */}
                                <MobileAuthMenu ignoreSignIn />

                                <div className="h-px bg-border my-1" />

                                {/* Mobile Languages */}
                                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Language
                                </div>
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLocale(lang.code);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between",
                                            locale === lang.code ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                                        )}
                                    >
                                        {lang.label}
                                        {locale === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </button>
                                ))}
                            </div>
                            <div className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[1px]" onClick={() => setIsOpen(false)} />
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

function AuthStatusAwareSignIn() {
    const { status } = useSession();

    if (status !== "unauthenticated") return null;

    return (
        <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm active:scale-95 transition-all"
        >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
        </button>
    );
}

function MobileAuthMenu({ ignoreSignIn }: { ignoreSignIn?: boolean }) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="flex items-center gap-2 px-3 py-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 h-4 rounded bg-muted" />
            </div>
        );
    }

    if (session) {
        return (
            <>
                {/* User Info */}
                <div className="px-3 py-2 flex items-center gap-2 bg-muted/20 rounded-lg mb-1">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium truncate">
                        {session.user?.email}
                    </span>
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </>
        );
    }

    if (ignoreSignIn) return null;

    return (
        <button
            onClick={() => signIn("google")}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
        >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
        </button>
    );
}
