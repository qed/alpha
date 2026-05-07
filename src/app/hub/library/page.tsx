import { requireAuth } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { LibraryAccordion } from "@/components/hub/library-accordion";

export default async function LibraryPage() {
  const session = await requireAuth();
  const supabase = getSupabaseAdminClient();

  // Fetch library items for this geography (or global items with null geography_id)
  const { data: libraryItems } = await supabase
    .from("library_items")
    .select("id, type, title, body, author, concern, send_count, geography_id")
    .or(
      `geography_id.is.null,geography_id.eq.${session.geographyId}`
    )
    .order("send_count", { ascending: false });

  // Fetch the champion's prospects for the SendComposer typeahead
  const { data: prospects } = await supabase
    .from("prospects")
    .select("id, parent_first, parent_last, parent_email")
    .eq("geography_id", session.geographyId ?? "")
    .order("parent_last", { ascending: true });

  const items = (libraryItems ?? []).map((item) => ({
    id: item.id as string,
    type: item.type as string,
    title: item.title as string,
    body: item.body as string,
    author: (item.author as string | null) ?? null,
    concern: (item.concern as string | null) ?? null,
    send_count: (item.send_count as number) ?? 0,
  }));

  const prospectList = (prospects ?? []).map((p) => ({
    id: p.id as string,
    parent_first: p.parent_first as string,
    parent_last: p.parent_last as string,
    email: (p.parent_email as string | null) ?? null,
  }));

  return (
    <div className="max-w-[920px] mx-auto px-8 py-10 max-sm:px-5 max-sm:py-8">
      <h1 className="font-[family-name:var(--font-display)] font-extrabold text-[clamp(24px,5vw,36px)] leading-[1.1] tracking-[-0.03em] mb-2 text-ink">
        Library
      </h1>
      <p className="text-[15px] leading-[1.6] text-ink-3 mb-8">
        Reference materials for championing Alpha School — FAQs, parent
        testimonials, and talking points all in one place.
      </p>
      <LibraryAccordion items={items} prospects={prospectList} />
    </div>
  );
}
