import { DestinationView } from "@/components/DestinationView";
import { getDestination } from "@/lib/driveService";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DestinationPage({ params }: PageProps) {
    const { id } = await params;
    const destination = await getDestination(id);

    if (!destination) {
        notFound();
    }

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
                    <div className="relative z-10">
                        <h1 className="text-5xl font-bold tracking-tight mb-2">{destination.name}</h1>
                        <p className="text-muted-foreground text-lg">
                            Plan and organize your trip details
                        </p>
                    </div>
                </div>
            </div>

            <DestinationView destination={destination} />
        </div>
    );
}
