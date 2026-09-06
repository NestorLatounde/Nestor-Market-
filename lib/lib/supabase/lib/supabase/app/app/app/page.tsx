import { createClient } from "@/lib/supabase/server";
import BrowseClient from "@/components/BrowseClient";
import type { Listing } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_media(*)")
    .order("created_at", { ascending: false });

  const raw: Listing[] = error ? [] : (data as Listing[]);
  const now = Date.now();
  const listings = [...raw].sort((a, b) => {
    const aFeatured = a.is_featured && a.featured_until && new Date(a.featured_until).getTime() > now;
    const bFeatured = b.is_featured && b.featured_until && new Date(b.featured_until).getTime() > now;
    if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="font-mono text-xs tracking-widest uppercase text-amber mb-2">
          {listings.length} annonce{listings.length > 1 ? "s" : ""} sur le marché
        </div>
        <h1 className="font-display font-semibold text-3xl md:text-4xl">
          Qu&apos;est-ce que tu cherches aujourd&apos;hui ?
        </h1>
      </div>

      <BrowseClient listings={listings} loadError={Boolean(error)} />
    </div>
  );
}
