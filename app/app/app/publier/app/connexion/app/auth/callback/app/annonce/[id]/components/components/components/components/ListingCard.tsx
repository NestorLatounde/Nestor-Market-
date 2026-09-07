import Link from "next/link";
import { Tag, MapPin, Film } from "lucide-react";
import type { Listing } from "@/lib/types";
import { timeAgo } from "@/lib/constants";

export default function ListingCard({ listing, rotation = 0 }: { listing: Listing; rotation?: number }) {
  const media = [...(listing.listing_media ?? [])].sort((a, b) => a.position - b.position);
  const cover = media[0];
  const isFeatured = listing.is_featured && listing.featured_until && new Date(listing.featured_until).getTime() > Date.now();

  return (
    <Link
      href={`/annonce/${listing.id}`}
      className="tag-card block overflow-hidden relative"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {isFeatured && (
        <div className="absolute top-2 right-2 z-10 bg-amber text-ink-900 text-[0.62rem] font-bold px-2 py-1 rounded-full font-mono">
          ★ En avant
        </div>
      )}
      {cover && (
        <div className="relative w-full h-40 bg-ink-900">
          {cover.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <video src={cover.url} muted preload="metadata" className="w-full h-full object-cover" />
          )}
          {cover.kind === "video" && (
            <div className="absolute bottom-2 right-2 bg-ink-900/80 rounded-full p-1.5">
              <Film size={12} className="text-hi" />
            </div>
          )}
          {media.length > 1 && (
            <div className="absolute bottom-2 left-2 bg-ink-900/80 rounded-full px-2 py-0.5 text-[0.62rem] text-hi font-mono">
              +{media.length - 1}
            </div>
          )}
        </div>
      )}
      <div className={cover ? "px-8 pb-6 pt-5" : "p-6 pl-8"}>
        <div className="font-mono text-[0.65rem] tracking-widest uppercase text-amber-deep mb-2 flex items-center gap-1.5">
          <Tag size={11} />
          {listing.type === "service" ? "Service" : "Produit"} · {listing.category}
        </div>
        <h3 className="font-display font-semibold text-lg mb-2 leading-tight">{listing.title}</h3>
        <p className="text-sm text-[#4C4636] mb-4 leading-relaxed line-clamp-2">{listing.description}</p>
        <div className="flex items-center justify-between border-t border-dashed border-paper-dim pt-3 font-mono">
          <span className="text-sm font-medium">{listing.price}</span>
          <span className="text-xs text-[#6B6350] flex items-center gap-1">
            <MapPin size={11} /> {listing.commune}, {listing.country}
          </span>
        </div>
        <div className="text-[0.68rem] text-[#8A836E] mt-2 font-mono flex items-center justify-between">
          <span>{timeAgo(listing.created_at)}</span>
          {typeof listing.distance_km === "number" && (
            <span>{listing.distance_km < 1 ? "< 1 km" : `${Math.round(listing.distance_km)} km`}</span>
          )}
        </div>
      </div>
    </Link>
  );
          }
