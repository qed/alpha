import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { getAvailableGeographies } from "@/lib/queries/geographies";
import { GeographyPicker } from "@/components/dashboard/geography-picker";

export const metadata: Metadata = {
  title: "Alpha Hub",
  description:
    "Enroll your family at Alpha School — the future of education across 53 cities.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  if (!session.geographyId) {
    const geographies = await getAvailableGeographies();
    return (
      <div className="px-6 py-8">
        <GeographyPicker geographies={geographies} />
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      {children}
    </div>
  );
}
