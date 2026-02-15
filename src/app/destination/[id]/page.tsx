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
            <DestinationView destination={destination} />
        </div>
    );
}
