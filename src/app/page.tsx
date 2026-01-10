import { DashboardView } from "@/components/DashboardView";
import { getDestinations } from "@/lib/driveService";

export default async function Home() {
  const destinations = await getDestinations();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <DashboardView initialDestinations={destinations} />
    </div>
  );
}
