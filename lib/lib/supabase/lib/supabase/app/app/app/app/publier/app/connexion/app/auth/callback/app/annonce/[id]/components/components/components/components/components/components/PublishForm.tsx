"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, MapPin, ImagePlus, X, Film } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  SERVICE_CATEGORIES,
  PRODUIT_CATEGORIES,
  COUNTRIES,
  MAX_MEDIA_FILES,
  MAX_IMAGE_MB,
  MAX_VIDEO_MB,
} from "@/lib/constants";
import type { ListingType } from "@/lib/types";

type PendingFile = {
  file: File;
  kind: "image" | "video";
  previewUrl: string;
};

export default function PublishForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [type, setType] = useState<ListingType>("service");
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [country, setCountry] = useState("France");
  const [commune, setCommune] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [media, setMedia] = useState<PendingFile[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const categoryOptions = type === "service" ? SERVICE_CATEGORIES : PRODUIT_CATEGORIES;

  function handleTypeChange(next: ListingType) {
    setType(next);
    setCategory(next === "service" ? SERVICE_CATEGORIES[0] : PRODUIT_CATEGORIES[0]);
  }

  function detectPosition() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`
          );
          const data = await res.json();
          if (data?.countryName) {
            const match = COUNTRIES.find((c) => c.toLowerCase() === data.countryName.toLowerCase());
            setCountry(match || data.countryName);
          }
          if (data?.locality || data?.city) setCommune(data.locality || data.city);
        } catch {
          // coordonnées seules suffisent, la commune reste modifiable à la main
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    setMediaError(null);
    const incoming = Array.from(fileList);

    if (media.length + incoming.length > MAX_MEDIA_FILES) {
      setMediaError(`${MAX_MEDIA_FILES} fichiers maximum par annonce.`);
      return;
    }

    const next: PendingFile[] = [...media];
    for (const file of incoming) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        setMediaError("Seuls les fichiers photo ou vidéo sont acceptés.");
        continue;
      }
      const maxMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (file.size > maxMb * 1024 * 1024) {
        setMediaError(`« ${file.name} » dépasse la taille maximale (${maxMb} Mo).`);
        continue;
      }
      next.push({ file, kind: isVideo ? "video" : "image", previewUrl: URL.createObjectURL(file) });
    }
    setMedia(next);
  }

  function removeFile(index: number) {
    setMedia((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Donne un titre à ton annonce.";
    if (!description.trim()) nextErrors.description = "Décris ta demande ou ton offre en une phrase ou deux.";
    if (!price.trim()) nextErrors.price = "Indique un prix, même approximatif.";
    if (!commune.trim()) nextErrors.commune = "Indique ta commune, pour que les recherches locales te trouvent.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);

    const { data: listing, error } = await supabase
      .from("listings")
      .insert({
        user_id: userId,
        type,
        category,
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        country,
        commune: commune.trim(),
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      })
      .select()
      .single();

    if (error || !listing) {
      setSubmitting(false);
      setServerError("La publication a échoué. Réessaie dans un instant.");
      return;
    }

    // Envoie les photos/vidéos une fois l'annonce créée, pour les ranger
    // dans un dossier `<user_id>/<listing_id>/...` propre au vendeur.
    if (media.length > 0) {
      for (let i = 0; i < media.length; i++) {
        setUploadStatus(`Envoi du fichier ${i + 1} sur ${media.length}…`);
        const { file, kind } = media[i];
        const ext = file.name.split(".").pop() || (kind === "video" ? "mp4" : "jpg");
        const path = `${userId}/${listing.id}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage.from("listing-media").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

        if (uploadError) continue; // on n'interrompt pas la publication pour un fichier en échec

        const { data: publicUrlData } = supabase.storage.from("listing-media").getPublicUrl(path);

        await supabase.from("listing_media").insert({
          listing_id: listing.id,
          user_id: userId,
          url: publicUrlData.publicUrl,
          kind,
          position: i,
        });
      }
    }

    setUploadStatus(null);
    setSubmitting(false);
    router.push(`/annonce/${listing.id}`);
    router.refresh();
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-line-strong bg-ink-800 text-hi placeholder:text-lo text-sm focus:outline-none focus:ring-2 focus:ring-amber";

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <span className="block text-xs font-bold mb-2">C&apos;est une…</span>
        <div className="flex gap-2.5">
          {(
            [
              { key: "service" as const, label: "Demande / offre de service" },
              { key: "produit" as const, label: "Demande / offre de produit" },
            ]
          ).map((opt) => (
            <button
              type="button"
              key={opt.key}
              onClick={() => handleTypeChange(opt.key)}
              className={`flex-1 text-left px-4 py-3 rounded-lg border text-sm font-semibold transition-colors ${
                type === opt.key
                  ? "border-amber text-amber bg-amber/10"
                  : "border-line-strong bg-ink-800 text-hi"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-bold mb-2">Catégorie</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-bold mb-2">Titre</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex. Cours de guitare pour débutants"
          className={inputClass}
        />
        {errors.title && <div className="text-amber text-xs mt-1.5">{errors.title}</div>}
      </div>

      <div className="mb-5">
        <label className="block text-xs font-bold mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décris ce que tu cherches ou ce que tu proposes, en une ou deux phrases."
          rows={4}
          className={`${inputClass} resize-y`}
        />
        {errors.description && <div className="text-amber text-xs mt-1.5">{errors.description}</div>}
      </div>

      <div className="mb-5">
        <label className="block text-xs font-bold mb-2">
          Photos & vidéos <span className="font-normal text-lo">(optionnel, {MAX_MEDIA_FILES} max)</span>
        </label>

        <div className="flex flex-wrap gap-3 mb-3">
          {media.map((m, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-line-strong">
              {m.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.previewUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <video src={m.previewUrl} muted className="w-full h-full object-cover" />
              )}
              {m.kind === "video" && (
                <div className="absolute bottom-1 left-1 bg-ink-900/80 rounded p-0.5">
                  <Film size={10} className="text-hi" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label="Retirer ce fichier"
                className="absolute top-1 right-1 bg-ink-900/80 rounded-full p-0.5 text-hi"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {media.length < MAX_MEDIA_FILES && (
            <label className="w-20 h-20 rounded-lg border border-dashed border-line-strong flex flex-col items-center justify-center gap-1 cursor-pointer text-lo hover:border-amber hover:text-amber transition-colors">
              <ImagePlus size={18} />
              <span className="text-[0.62rem] font-semibold">Ajouter</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="hidden"
              />
            </label>
          )}
        </div>
        {mediaError && <div className="text-amber text-xs mt-1">{mediaError}</div>}
      </div>

      <div className="mb-5">
        <label className="block text-xs font-bold mb-2">Pays</label>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3.5 mb-5">
        <div className="flex-1">
          <label className="block text-xs font-bold mb-2">Prix</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex. 25 €/h ou 60 €"
            className={inputClass}
          />
          {errors.price && <div className="text-amber text-xs mt-1.5">{errors.price}</div>}
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold mb-2">Commune</label>
          <input
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            placeholder="Ex. Lyon, Dakar, à distance…"
            className={inputClass}
          />
          {errors.commune && <div className="text-amber text-xs mt-1.5">{errors.commune}</div>}
        </div>
      </div>

      <button
        type="button"
        onClick={detectPosition}
        disabled={locating}
        className="flex items-center gap-2 text-xs font-semibold text-lo hover:text-amber transition-colors mb-6"
      >
        <MapPin size={13} />
        {locating
          ? "Localisation…"
          : coords
          ? "Position enregistrée avec l'annonce"
          : "Utiliser ma position (recommandé, pour un vrai calcul de distance)"}
      </button>

      {serverError && <div className="text-amber text-sm mb-4">{serverError}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-6 py-3 rounded-md bg-amber text-ink-900 font-bold text-sm hover:bg-amber-deep transition-colors disabled:opacity-60"
      >
        <ArrowLeftRight size={16} />
        {submitting ? uploadStatus || "Publication…" : "Publier l'annonce"}
      </button>
    </form>
  );
  }
