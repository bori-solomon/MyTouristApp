import { DestinationView } from "@/components/DestinationView";
import { getDestination } from "@/lib/driveService";
import { ArrowLeft, Calendar, Users, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isFuture, format } from "date-fns";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DestinationPage({ params }: PageProps) {
    const { id } = await params;
    const destination = await getDestination(id);

    if (!destination) {
        notFound();
    }

    const isUpcoming = destination.travelDate ? isFuture(new Date(destination.travelDate)) : false;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </Link>

                <div className="relative rounded-3xl overflow-hidden bg-card border border-border aspect-[5/1] flex items-end p-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-background to-background" />
                    <div className="relative z-10 w-full">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <h1 className={`text-5xl font-bold tracking-tight mb-2 ${isUpcoming ? "text-yellow-400" : ""}`}>
                                    {destination.name}
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Plan and organize your trip details
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-border/50">
                                {destination.travelDate && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{format(new Date(destination.travelDate), "MMM d, yyyy")}</span>
                                    </div>
                                )}
                                {destination.dueDate && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-orange-400" />
                                        <span className="font-medium">{format(new Date(destination.dueDate), "MMM d, yyyy")}</span>
                                    </div>
                                )}
                                {destination.participants && destination.participants.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        <span className="font-medium">{destination.participants.join(", ")}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DestinationView destination={destination} />
        </div>
    );
}
