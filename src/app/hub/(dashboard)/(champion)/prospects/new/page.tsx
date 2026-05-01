import { requireAuthenticated } from "@/lib/auth";
import { GeographyPicker } from "@/components/dashboard/geography-picker";
import { getAvailableGeographies } from "@/lib/queries/geographies";
import { NewProspectForm } from "@/components/dashboard/new-prospect-form";

export default async function NewProspectPage() {
  const session = await requireAuthenticated();

  if (!session.geographyId) {
    const geographies = await getAvailableGeographies();
    return <GeographyPicker geographies={geographies} />;
  }

  return <NewProspectForm />;
}
