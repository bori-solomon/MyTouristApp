import { DashboardView } from "@/components/DashboardView";
import { getDestinations } from "@/lib/driveService";
import { auth } from "@/lib/auth";
import Image from "next/image";

export default async function Home() {
  const session = await auth();
  const destinations = session ? await getDestinations() : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {session ? (
        <DashboardView initialDestinations={destinations} />
      ) : (
        <div className="relative rounded-3xl overflow-hidden min-h-[500px] flex items-center justify-center text-center p-8 bg-muted border border-border shadow-xl">
          {/* Background Image with Overlay */}
          <Image
            src="/landing-bg.png"
            alt="Travel background"
            fill
            priority
            className="object-cover transition-transform hover:scale-105 duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />

          <div className="relative z-10 max-w-2xl text-white">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 drop-shadow-lg">
              Welcome to Tourist App
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-white/90 drop-shadow-md">
              Your personal travel companion. Plan destinations, organize documents, and manage attractions all in one place.
            </p>
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
                <p className="px-6 py-3 text-sm font-medium">Please sign in from the top menu to start your journey</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
