"use client";

import { Destination } from "@/types";
import { useState } from "react";
import { DestinationCard } from "./DestinationCard";
import { DestinationListItem } from "./DestinationListItem";
import { LayoutGrid, List, ArrowUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { createDestinationAction } from "@/app/actions";
import { useRouter } from "next/navigation";

interface DashboardViewProps {
    initialDestinations: Destination[];
}

type SortField = "createdTime" | "travelDate" | "name";
type SortOrder = "asc" | "desc";

export function DashboardView({ initialDestinations }: DashboardViewProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortField, setSortField] = useState<SortField>("createdTime");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    // Sort destinations
    const sortedDestinations = [...initialDestinations].sort((a, b) => {
        // cast to any or check types to safely compare
        let valA: string | number = a[sortField] || "";
        let valB: string | number = b[sortField] || "";

        // Handle timestamps/dates
        if (sortField === "createdTime" || sortField === "travelDate") {
            // If date is valid, convert to number, else 0
            valA = valA ? new Date(valA as string).getTime() : 0;
            valB = valB ? new Date(valB as string).getTime() : 0;
        } else {
            // For strings (name), ensure lowercase comparison if needed, or standard string compare
            valA = (valA as string).toLowerCase();
            valB = (valB as string).toLowerCase();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const { dict } = useLanguage();

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("desc"); // Default to desc for new field
        }
    };

    const handleNewTrip = async () => {
        const name = prompt("Enter destination name:");
        if (!name || isCreating) return;

        setIsCreating(true);
        try {
            const result = await createDestinationAction(name);
            if (result.success && result.destinationId) {
                router.push(`/destination/${result.destinationId}`);
            } else {
                alert(result.error || "Failed to create trip");
            }
        } catch (error) {
            console.error("Error creating trip:", error);
            alert("An unexpected error occurred");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">{dict.dashboard.title}</h1>
                    <p className="text-muted-foreground text-lg">
                        {dict.dashboard.subtitle}
                    </p>
                </div>
                <button
                    onClick={handleNewTrip}
                    disabled={isCreating}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Plus className="w-5 h-5" />
                    )}
                    <span>{dict.dashboard.newTrip}</span>
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            viewMode === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                        title="List View"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-4 text-sm overflow-x-auto pb-2 sm:pb-0">
                    <span className="text-muted-foreground whitespace-nowrap">{dict.dashboard.sort.label}</span>
                    {(["createdTime", "travelDate", "name"] as SortField[]).map((field) => (
                        <button
                            key={field}
                            onClick={() => handleSort(field)}
                            className={cn(
                                "flex items-center gap-1 font-medium hover:text-primary transition-colors whitespace-nowrap",
                                sortField === field ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {field === "createdTime" ? dict.dashboard.sort.created : field === "travelDate" ? dict.dashboard.sort.date : dict.dashboard.sort.destination}
                            {sortField === field && <ArrowUpDown className="w-3 h-3" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {sortedDestinations.length === 0 ? (
                <div className="text-center py-20 bg-card/50 rounded-2xl border border-dashed border-border">
                    <h3 className="text-xl font-medium mb-2">{dict.dashboard.noTrips}</h3>
                    <p className="text-muted-foreground">{dict.dashboard.startCreate}</p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedDestinations.map((dest) => (
                        <DestinationCard key={dest.id} destination={dest} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {/* List Header */}
                    <div className="hidden md:flex px-4 py-2 text-sm font-medium text-muted-foreground">
                        <div className="flex-1 min-w-[200px]">{dict.dashboard.fields.destination}</div>
                        <div className="flex-1 min-w-[150px]">{dict.dashboard.fields.date}</div>
                        <div className="flex-1 min-w-[200px]">{dict.dashboard.fields.participants}</div>
                        <div className="w-[100px]"></div>
                    </div>
                    {sortedDestinations.map((dest) => (
                        <DestinationListItem key={dest.id} destination={dest} />
                    ))}
                </div>
            )}
        </div>
    );
}
