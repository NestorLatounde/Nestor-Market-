"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Inbox, MapPin, X } from "lucide-react";
import type { Listing } from "@/lib/types";
import ListingCard from "@/components/ListingCard";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const ROTATIONS = [-1.2, 0.8, -0.4, 1, -0.9, 0.5, -1.5, 0.7];

export default function BrowseClient({
  listings,
  loadError,
}: {
  listings: Listing[];
  loadError: boolean;
}) {
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"tous" | "service" | "produit">("tous");
  const [countryFilter, setCountryFilter] = useState("tous");
  const [communeQuery, setCommuneQuery] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [nearMe, setNearMe] = useState(false);

  const [fallbackResults, setFallbackResults] = useState<Listing[] | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackNeedsLocation, setFallbackNeedsLocation] = useState(false);

  const availableCountries = useMemo(
    () => Array.from(new Set(listings.map((l) => l.country).filter(Boolean))).sort(),
    [listings]
  );

  const preCommune = useMemo(() => {
    return listings.filter((l) => {
      if (typeFilter !== "tous" && l.type !== typeFilter) return false;
      if (countryFilter !== "tous" && l.country !== countryFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    });
  }, [listings, typeFilter, countryFilter, search]);

  const communeQ = communeQuery.trim().toLowerCase();
  const exactCommuneMatches = communeQ ? preCommune.filter((l) => l.commune.toLowerCase().includes(communeQ)) : null;
  const needsFallback = Boolean(communeQ) && exactCommuneMatches !== null && exactCommuneMatches.length === 0;

  useEffect(() => {
    let cancelled = false;
    if (!needsFallback) {
      setFallbackResults(null);
      setFallbackNeedsLocation(false);
      return;
    }
    if (!coords) {
      setFallbackNeedsLocation(true);
      setFallbackResults(null);
      return;
    }
    setFallbackNeedsLocation(false);
    setFallbackLoading(true);
    supabase
      .rpc("listings_by_distance", {
        origin_lat: coords.lat,
        origin_lng: coords.lng,
        p_type: typeFilter !== "tous" ? typeFilter : null,
        p_country: countryFilter !== "tous" ? countryFilter : null,
      })
      .then(({ data, error }: { data: Listing[] | null; error: unknown }) => {
        if (cancelled) return;
        setFallbackLoading(false);
        setFallbackResults(error ? [] : (data as Listing[]));
      });
    return () => {
      cancelled = true;
    };
  }, [needsFallback, coords, typeFilter, countryFilter, supabase]);

  function detectPosition() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setNearMe(true);
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`
          );
          const data = await res.json();
          if (data?.countryName) {
            const match = availableCountries.find((c) => c.toLowerCase() === data.countryName.toLowerCase());
            setCountryFilter(match || data.countryName);
          }
          if (data?.locality || data?.city) setCommuneQuery(data.locality || data.city);
        } catch {
          // les coordonnées seules suffisent pour le repli par distance
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  const displayed = communeQ
    ? exactCommuneMatches && exactCommuneMatches.length > 0
      ? exactCommuneMatches
      : fallbackResults ?? []
    : preCommune;

  if (loadError) {
    return (
      <div className="text-center py-16 border border-dashed border-line-strong rounded-2xl text-lo">
        Impossible de charger les annonces pour l&apos;instant. Vérifie que les variables Supabase sont bien
        configurées.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 mb-4 md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-lo" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une annonce, une catégorie…"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-line-strong bg-ink-800 text-hi placeholder:text-lo text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>
        <div className="flex gap-2">
          {(
            [
              { key: "tous", label: "Tous" },
              { key: "service", label: "Services" },
              { key: "produit", label: "Produits" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTypeFilter(opt.key)}
              className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap ${
                typeFilter === opt.key
                  ? "border-amber text-amber"
                  : "border-line-strong text-hi hover:border-amber hover:text-amber"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2.5 mb-6 md:items-center">
        <select
          value={countryFilter}
          onChange={(e) => {
            setCountryFilter(e.target.value);
            setNearMe(false);
          }}
          className={`px-3.5 py-2.5 rounded-lg border bg-ink-800 text-sm cursor-pointer ${
            countryFilter !== "tous" ? "border-amber text-amber" : "border-line-strong text-hi"
          }`}
        >
          <option value="tous">🌍 Tous les pays</option>
          {availableCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="relative">
          <input
            value={communeQuery}
            onChange={(e) => setCommuneQuery(e.target.value)}
            placeholder="Commune…"
            className={`w-full md:w-40 pl-3.5 pr-8 py-2.5 rounded-lg border bg-ink-800 text-sm ${
              communeQuery ? "border-amber text-amber" : "border-line-strong text-hi"
            }`}
          />
          {communeQuery && (
            <button
              onClick={() => setCommuneQuery("")}
              aria-label="Effacer la commune"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-lo"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={detectPosition}
          disabled={locating}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-semibold whitespace-nowrap ${
            nearMe ? "border-amber text-amber bg-amber/10" : "border-line-strong text-hi"
          }`}
        >
          <MapPin size={14} />
          {locating ? "Localisation…" : nearMe ? "Autour de toi" : "Utiliser ma position"}
        </button>

        {countryFilter !== "tous" && (
          <button
            onClick={() => {
              setCountryFilter("tous");
              setNearMe(false);
            }}
            aria-label="Effacer le filtre pays"
            className="text-lo hover:text-hi"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {needsFallback && fallbackNeedsLocation && (
        <div className="flex items-center gap-2.5 bg-amber/10 border border-amber rounded-xl px-4 py-3 mb-6 text-sm">
          <MapPin size={16} className="text-amber shrink-0" />
          <span>
            Aucune annonce trouvée exactement à <strong>{communeQuery.trim()}</strong>. Active
            <button onClick={detectPosition} className="mx-1 underline font-semibold text-amber">
              ta position
            </button>
            pour voir les résultats de la commune la plus proche par vraie distance.
          </span>
        </div>
      )}

      {needsFallback && !fallbackNeedsLocation && !fallbackLoading && fallbackResults && fallbackResults.length > 0 && (
        <div className="flex items-center gap-2.5 bg-amber/10 border border-amber rounded-xl px-4 py-3 mb-6 text-sm">
          <MapPin size={16} className="text-amber shrink-0" />
          <span>
            Aucune annonce trouvée exactement à <strong>{communeQuery.trim()}</strong>. Voici les résultats de{" "}
            <strong>{fallbackResults[0].commune}</strong>, la commune disponible la plus proche
            {typeof fallbackResults[0].distance_km === "number"
              ? ` (${Math.round(fallbackResults[0].distance_km)} km)`
              : ""}
            .
          </span>
        </div>
      )}

      {fallbackLoading ? (
        <div className="text-center py-16 text-lo">Recherche des annonces les plus proches…</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 px-6 border border-dashed border-line-strong rounded-2xl text-lo">
          <Inbox size={28} className="mx-auto mb-4" />
          <p className="mb-5">Aucune annonce ne correspond. Sois le premier à publier !</p>
          <Link
            href="/publier"
            className="inline-block px-5 py-2.5 rounded-md bg-amber text-ink-900 font-bold text-sm hover:bg-amber-deep transition-colors"
          >
            Publier une annonce
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayed.map((l, i) => (
            <ListingCard key={l.id} listing={l} rotation={ROTATIONS[i % ROTATIONS.length]} />
          ))}
        </div>
      )}
    </div>
  );
    }
