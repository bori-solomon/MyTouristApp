"use client";

import { Destination } from "@/types";
import { ArrowRight, MapPin, Calendar, Users, Clock } from "lucide-react";
import Link from "next/link";
import { format, isFuture } from "date-fns";
import { useState } from "react";
import { updateDestinationAction } from "@/app/actions";
import { useLanguage } from "@/contexts/LanguageContext";

interface DestinationCardProps {
    destination: Destination;
}

export function DestinationCard({ destination }: DestinationCardProps) {
    const [travelDate, setTravelDate] = useState(destination.travelDate || "");
    const [dueDate, setDueDate] = useState(destination.dueDate || "");
    const [participants, setParticipants] = useState(destination.participants?.join(", ") || "");
    const [isEditing, setIsEditing] = useState(false);

    const { dict } = useLanguage();

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        await updateDestinationAction(destination.id, {
            travelDate,
            dueDate,
            participants: participants.split(",").map(p => p.trim()).filter(Boolean)
        });
        setIsEditing(false);
    };

    const toggleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(!isEditing);
    };

    const isUpcoming = destination.travelDate ? isFuture(new Date(destination.travelDate)) : false;

    return (
        <Link href={`/destination/${destination.id}`} className="group block h-full">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-primary/5 h-full flex flex-col justify-end p-6 min-h-[250px]">

                {/* Abstract Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/50 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">{dict.dashboard.fields.destination}</span>
                            <span className="text-xs ml-auto text-muted-foreground">{format(new Date(destination.createdTime || new Date()), "MMM d, yyyy")}</span>
                        </div>
                        {/* Conditionally style the name based on date */}
                        <h3 className={`text-2xl font-bold mb-1 transition-colors ${isUpcoming ? "text-yellow-400" : "text-foreground group-hover:text-primary"
                            }`}>
                            {destination.name}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                            {destination.categories.length} categories • {destination.attractions.length} attractions
                        </p>
                    </div>

                    <div className="space-y-3 relative z-20" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground" onClick={toggleEdit}>
                            <Calendar className="w-4 h-4" />
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={travelDate}
                                    onChange={(e) => setTravelDate(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="bg-background border border-border rounded px-2 py-0.5 text-xs w-full focus:ring-1 focus:ring-primary outline-none"
                                />
                            ) : (
                                <span>{destination.travelDate ? format(new Date(destination.travelDate), "MMM d, yyyy") : dict.dashboard.fields.setDate}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground" onClick={toggleEdit}>
                            <Clock className="w-4 h-4 text-orange-400/70" />
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="bg-background border border-border rounded px-2 py-0.5 text-xs w-full focus:ring-1 focus:ring-primary outline-none"
                                />
                            ) : (
                                <span>{destination.dueDate ? format(new Date(destination.dueDate), "MMM d, yyyy") : dict.dashboard.fields.setDueDate}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground" onClick={toggleEdit}>
                            <Users className="w-4 h-4" />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={participants}
                                    onChange={(e) => setParticipants(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    placeholder={dict.dashboard.fields.participants + "..."}
                                    className="bg-background border border-border rounded px-2 py-0.5 text-xs w-full focus:ring-1 focus:ring-primary outline-none"
                                />
                            ) : (
                                <span className="truncate">
                                    {destination.participants?.length ? destination.participants.join(", ") : dict.dashboard.fields.addPeople}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            {isEditing ? (
                                <button
                                    onClick={handleSave}
                                    className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90"
                                >
                                    {dict.common.save}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 group-hover:translate-x-1 transition-transform ml-auto">
                                    <span>{dict.destination.viewPlan}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
