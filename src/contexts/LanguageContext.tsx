"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { dictionaries, Locale, Dictionary } from "@/lib/dictionaries";

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("en");

    useEffect(() => {
        // Load from local storage if available
        const saved = localStorage.getItem("app-locale") as Locale;
        if (saved && ["en", "ru", "ua", "ja"].includes(saved)) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem("app-locale", newLocale);
    };

    const value = {
        locale,
        setLocale,
        dict: dictionaries[locale]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
