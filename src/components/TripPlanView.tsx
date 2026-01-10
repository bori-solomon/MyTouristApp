"use client";

import { Destination, PlanEntry } from "@/types";
import { useState } from "react";
import { Plus, MapPin, Clock, FileText, Link as LinkIcon, Trash2, Edit2, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { updatePlanAction } from "@/app/actions";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, differenceInDays, addDays, startOfDay, isWithinInterval, parseISO } from "date-fns";

interface TripPlanViewProps {
    destination: Destination;
}

export function TripPlanView({ destination }: TripPlanViewProps) {
    const { dict } = useLanguage();
    const [plan, setPlan] = useState<PlanEntry[]>(destination.plan || []);
    const [isAdding, setIsAdding] = useState(false);
    const [editingEntry, setEditingEntry] = useState<PlanEntry | null>(null);

    // Form states
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [notes, setNotes] = useState("");
    const [linkTitle, setLinkTitle] = useState("");
    const [linkUrl, setLinkUrl] = useState("");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const newEntry: PlanEntry = {
            id: editingEntry?.id || Math.random().toString(36).substr(2, 9),
            title,
            location,
            startDate,
            endDate,
            notes,
            links: linkTitle && linkUrl ? [{ title: linkTitle, url: linkUrl }] : [],
            color: editingEntry?.color || "bg-primary"
        };

        const updatedPlan = editingEntry
            ? plan.map(item => item.id === editingEntry.id ? newEntry : item)
            : [...plan, newEntry];

        setPlan(updatedPlan);
        await updatePlanAction(destination.id, updatedPlan);
        resetForm();
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingEntry(null);
        setTitle("");
        setLocation("");
        setStartDate("");
        setEndDate("");
        setNotes("");
        setLinkTitle("");
        setLinkUrl("");
    };

    const handleEdit = (entry: PlanEntry) => {
        setEditingEntry(entry);
        setTitle(entry.title);
        setLocation(entry.location || "");
        setStartDate(entry.startDate);
        setEndDate(entry.endDate);
        setNotes(entry.notes || "");
        if (entry.links && entry.links.length > 0) {
            setLinkTitle(entry.links[0].title);
            setLinkUrl(entry.links[0].url);
        } else {
            setLinkTitle("");
            setLinkUrl("");
        }
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(dict.common.confirmDelete)) return;
        const updatedPlan = plan.filter(item => item.id !== id);
        setPlan(updatedPlan);
        await updatePlanAction(destination.id, updatedPlan);
    };

    // Sort plan by start date
    const sortedPlan = [...plan].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{dict.destination.plan.title}</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {dict.destination.plan.addItem}
                </button>
            </div>

            {/* Gantt Visualization Area - Vertical Scroll with Horizontal Bars */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden relative min-h-[500px] flex flex-col">
                {sortedPlan.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                        <Clock className="w-12 h-12 mb-4 opacity-20" />
                        <p>{dict.destination.plan.empty}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {/* Map through all unique days in the plan range */}
                        {(() => {
                            const entriesByDate: Record<string, PlanEntry[]> = {};
                            sortedPlan.forEach(entry => {
                                const date = format(new Date(entry.startDate), "yyyy-MM-dd");
                                if (!entriesByDate[date]) entriesByDate[date] = [];
                                entriesByDate[date].push(entry);
                            });

                            return Object.keys(entriesByDate).sort().map(dateStr => {
                                const date = new Date(dateStr);
                                const dayEntries = entriesByDate[dateStr];

                                return (
                                    <div key={dateStr} className="flex group/day">
                                        {/* Date Column (Sticky-ish vertical axis) */}
                                        <div className="w-24 sm:w-32 py-6 px-4 border-r border-border bg-muted/5 flex flex-col items-center justify-start shrink-0">
                                            <span className="text-xs font-bold text-primary uppercase tracking-tighter opacity-70">
                                                {format(date, "EEE")}
                                            </span>
                                            <span className="text-2xl font-black text-foreground">
                                                {format(date, "d")}
                                            </span>
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {format(date, "MMM")}
                                            </span>
                                        </div>

                                        {/* Activities Column */}
                                        <div className="flex-1 p-4 sm:p-6 space-y-4">
                                            {dayEntries.map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="group relative bg-muted/30 hover:bg-muted/50 rounded-xl p-4 transition-all border border-transparent hover:border-primary/20 shadow-sm"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="text-base font-bold text-foreground truncate">{entry.title}</h3>
                                                                {differenceInDays(new Date(entry.endDate), new Date(entry.startDate)) > 0 && (
                                                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">
                                                                        {differenceInDays(new Date(entry.endDate), new Date(entry.startDate)) + 1} Days
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                                {entry.location && (
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3 text-primary/60" />
                                                                        {entry.location}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3 text-primary/60" />
                                                                    {format(new Date(entry.startDate), "p")} - {format(new Date(entry.endDate), "p")}
                                                                </div>
                                                            </div>

                                                            {entry.notes && (
                                                                <div className="mt-3 text-xs text-muted-foreground bg-background/40 p-3 rounded-lg border border-border/50">
                                                                    <p className="line-clamp-2 hover:line-clamp-none transition-all">{entry.notes}</p>
                                                                </div>
                                                            )}

                                                            {entry.links && entry.links.length > 0 && (
                                                                <div className="mt-3 flex flex-wrap gap-2">
                                                                    {entry.links.map((link, i) => (
                                                                        <a
                                                                            key={i}
                                                                            href={link.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border rounded-lg text-[11px] font-semibold hover:border-primary/50 hover:text-primary transition-all shadow-sm"
                                                                        >
                                                                            <LinkIcon className="w-2.5 h-2.5" />
                                                                            {link.title}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Actions Overlay */}
                                                        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                            <button
                                                                onClick={() => handleEdit(entry)}
                                                                className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-primary transition-all"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(entry.id)}
                                                                className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-destructive transition-all"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-lg">
                                {editingEntry ? dict.common.save : dict.destination.plan.addItem}
                            </h3>
                            <button onClick={resetForm} className="p-1 hover:bg-muted rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{dict.destination.plan.itemTitle}</label>
                                <input
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{dict.destination.plan.startDate}</label>
                                    <input
                                        required
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{dict.destination.plan.endDate}</label>
                                    <input
                                        required
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{dict.destination.plan.location}</label>
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{dict.destination.plan.notes}</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2 h-24 resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{dict.destination.plan.links} (Title)</label>
                                    <input
                                        placeholder="e.g. Booking.com"
                                        value={linkTitle}
                                        onChange={(e) => setLinkTitle(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
                                >
                                    {dict.common.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                                >
                                    {dict.common.save}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
