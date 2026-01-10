"use client";

import { Attraction } from "@/types";
import { Plus, Trash2, MapPin } from "lucide-react";
import { useState } from "react";

import { useLanguage } from "@/contexts/LanguageContext";

interface AttractionListProps {
    attractions: Attraction[];
    onAdd: (name: string) => void;
    onRemove: (id: string) => void;
}

export function AttractionList({ attractions, onAdd, onRemove }: AttractionListProps) {
    const { dict } = useLanguage();
    const [newAttraction, setNewAttraction] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAttraction.trim()) {
            onAdd(newAttraction.trim());
            setNewAttraction("");
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {dict.destination.attractions.title}
            </h3>

            <div className="flex-1 overflow-y-auto min-h-[200px] space-y-3 mb-4 pr-1">
                {attractions.length === 0 ? (
                    <p className="text-muted-foreground text-sm italic py-2">
                        {dict.destination.attractions.empty}
                    </p>
                ) : (
                    attractions.map((attr) => (
                        <div
                            key={attr.id}
                            className="group flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <span className="font-medium text-sm">{attr.name}</span>
                            <button
                                onClick={() => onRemove(attr.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
                                title={dict.common.delete}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={newAttraction}
                    onChange={(e) => setNewAttraction(e.target.value)}
                    placeholder={dict.destination.attractions.placeholder}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                    type="submit"
                    disabled={!newAttraction.trim()}
                    className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
