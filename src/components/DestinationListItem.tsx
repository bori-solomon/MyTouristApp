"use client";

import { Destination } from "@/types";
import { format, isFuture } from "date-fns";
import { Users, Calendar, ArrowRight, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { updateDestinationAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface DestinationListItemProps {
    destination: Destination;
}

export function DestinationListItem({ destination }: DestinationListItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [travelDate, setTravelDate] = useState(destination.travelDate || "");
    const [dueDate, setDueDate] = useState(destination.dueDate || "");
    const [participants, setParticipants] = useState(destination.participants?.join(", ") || "");

    const { dict } = useLanguage();

    const handleSave = async () => {
        await updateDestinationAction(destination.id, {
            travelDate,
            dueDate,
            participants: participants.split(",").map(p => p.trim()).filter(Boolean)
        });
        setIsEditing(false);
    };

    const isUpcoming = destination.travelDate ? isFuture(new Date(destination.travelDate)) : false;

    return (
        <div className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-md">
            {/* Destination Name & Link */}
            <div className="flex-1 min-w-[200px]">
                <Link href={`/destination/${destination.id}`} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg transition-colors ${isUpcoming ? "text-yellow-400" : "group-hover:text-primary"
                            }`}>
                            {destination.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {format(new Date(destination.createdTime), "MMM d, yyyy")}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Travel Date */}
            <div className="flex-1 min-w-[150px]">
                {isEditing ? (
                    <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                    />
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" onClick={() => setIsEditing(true)}>
                        <Calendar className="w-4 h-4" />
                        <span>{destination.travelDate ? format(new Date(destination.travelDate), "MMM d, yyyy") : dict.dashboard.fields.setDate}</span>
                    </div>
                )}
            </div>

            {/* Due Date */}
            <div className="flex-1 min-w-[150px]">
                {isEditing ? (
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                    />
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" onClick={() => setIsEditing(true)}>
                        <Clock className="w-4 h-4 text-orange-400/70" />
                        <span>{destination.dueDate ? format(new Date(destination.dueDate), "MMM d, yyyy") : dict.dashboard.fields.setDueDate}</span>
                    </div>
                )}
            </div>

            {/* Participants */}
            <div className="flex-1 min-w-[200px]">
                {isEditing ? (
                    <input
                        type="text"
                        value={participants}
                        onChange={(e) => setParticipants(e.target.value)}
                        placeholder={dict.dashboard.fields.participants + "..."}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                    />
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" onClick={() => setIsEditing(true)}>
                        <Users className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">
                            {destination.participants?.length ? destination.participants.join(", ") : dict.dashboard.fields.addPeople}
                        </span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="w-[100px] flex justify-end">
                {isEditing ? (
                    <button
                        onClick={handleSave}
                        className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90"
                    >
                        {dict.common.save}
                    </button>
                ) : (
                    <Link
                        href={`/destination/${destination.id}`}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                )}
            </div>
        </div>
    );
}
