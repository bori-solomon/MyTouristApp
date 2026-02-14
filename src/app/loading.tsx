import { Plane } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Plane className="w-6 h-6 text-primary animate-pulse" />
                </div>
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">Loading trips...</p>
        </div>
    );
}
