"use client";

import Link from "next/link";
import { Map, Plane, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Locale } from "@/lib/dictionaries";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AuthButton } from "./AuthButton";

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
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {dict.nav.title}
                    </span>
                </Link>

                <div className="flex items-center gap-4">
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
                            <div className="absolute right-0 mt-2 w-40 bg-popover border border-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
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
            </div>
        </nav>
    );
}
