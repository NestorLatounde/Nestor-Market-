import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/constants";
import { Tag, MapPin } from "lucide-react";
import MessageThread from "@/components/MessageThread";
import MediaGallery from "@/components/MediaGallery";
import type { Listing, Message } from "@/lib/types";

export const revalidate = 0;

export default async function AnnoncePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: listing }, { data: messages }, { data: userData }] = await Promise.all([
    supabase.from("listings").select("*, listing_media(*)").eq("id", params.id).single(),
    supabase
      .from("messages")
      .select("*, profiles(display_name)")
      .eq("listing_id", params.id)
      .order("created_at", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  if (!listing) notFound();

  const user = userData.user;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <MediaGallery media={(listing as Listing).listing_media ?? []} />

      <div className="tag-card p-7 pl-9 mb-10">
        <div className="font-mono text-[0.65rem] tracking-widest uppercase text-amber-deep mb-2 flex items-center gap-1.5">
          <Tag size={12} />
          {(listing as Listing).type === "service" ? "Service" : "Produit"} · {(listing as Listing).category}
        </div>
        <h1 className="font-display font-semibold text-2xl mb-3 leading-tight">{(listing as Listing).title}</h1>
        <p className="text-sm text-[#4C4636] mb-5 leading-relaxed">{(listing as Listing).description}</p>
        <div className="flex items-center justify-between border-t border-dashed border-paper-dim pt-4 font-mono">
          <span className="text-base font-semibold">{(listing as Listing).price}</span>
          <span className="text-xs text-[#6B6350] flex items-center gap-1">
            <MapPin size={12} /> {(listing as Listing).commune}, {(listing as Listing).country}
          </span>
        </div>
        <div className="text-[0.68rem] text-[#8A836E] mt-2 font-mono">
          Publiée {timeAgo((listing as Listing).created_at)}
        </div>
      </div>

      <MessageThread
        listingId={(listing as Listing).id}
        initialMessages={(messages as Message[]) ?? []}
        currentUserId={user?.id ?? null}
      />
    </div>
  );
                                     }
