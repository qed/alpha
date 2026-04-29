import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { IntakeForm } from "@/components/intake/intake-form";
import { CitySelector } from "@/components/intake/city-selector";

interface Props {
  params: Promise<{ geography: string }>;
}

async function getGeographies() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("geographies")
    .select("slug, name")
    .order("name");

  return data || [];
}

export default async function IntakePage({ params }: Props) {
  const { geography } = await params;
  const geographies = await getGeographies();
  const current = geographies.find((g) => g.slug === geography);

  if (!current) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-ink">
            Join Alpha School
          </h1>
          <p className="mt-2 text-ink-3">
            Express your interest in Alpha School in{" "}
            <strong>{current.name}</strong>.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-ink mb-1">
            Select your city
          </label>
          <CitySelector geographies={geographies} currentSlug={geography} />
        </div>

        <div className="bg-paper border border-line rounded-md p-6 shadow-sm">
          <IntakeForm geographySlug={geography} />
        </div>
      </div>
    </main>
  );
}
