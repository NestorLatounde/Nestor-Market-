"use client";

import { useState } from "react";
import type { Media } from "@/lib/types";

export default function MediaGallery({ media }: { media: Media[] }) {
  const sorted = [...media].sort((a, b) => a.position - b.position);
  const [active, setActive] = useState(0);

  if (sorted.length === 0) return null;
  const current = sorted[active];

  return (
    <div className="mb-6">
      <div className="rounded-xl overflow-hidden bg-ink-800 border border-line-strong">
        {current.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt="" className="w-full max-h-[420px] object-contain bg-ink-900" />
        ) : (
          <video src={current.url} controls className="w-full max-h-[420px] bg-ink-900" />
        )}
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {sorted.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border shrink-0 ${
                i === active ? "border-amber" : "border-line-strong opacity-70"
              }`}
            >
              {m.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <video src={m.url} muted preload="metadata" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
                  }
