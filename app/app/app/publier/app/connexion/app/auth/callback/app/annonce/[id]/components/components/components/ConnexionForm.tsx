"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionForm({ next }: { next: string }) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !displayName.trim()) return;

    setStatus("sending");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        data: { display_name: displayName.trim() },
      },
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <div className="border border-line rounded-xl p-6 bg-ink-800 text-sm text-hi leading-relaxed">
        Un lien de connexion vient d&apos;être envoyé à <strong>{email}</strong>. Ouvre-le depuis cet appareil pour
        être connecté.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-bold mb-2">Ton prénom</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ex. Nadia"
          required
          className="w-full px-4 py-3 rounded-lg border border-line-strong bg-ink-800 text-hi placeholder:text-lo text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Adresse e-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="toi@exemple.fr"
          required
          className="w-full px-4 py-3 rounded-lg border border-line-strong bg-ink-800 text-hi placeholder:text-lo text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>

      {status === "error" && (
        <div className="text-amber text-sm">L&apos;envoi a échoué. Vérifie l&apos;adresse et réessaie.</div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="px-5 py-3 rounded-md bg-amber text-ink-900 font-bold text-sm hover:bg-amber-deep transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Envoi…" : "Recevoir mon lien de connexion"}
      </button>
    </form>
  );
    }
