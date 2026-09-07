import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PublishForm from "@/components/PublishForm";

export default async function PublierPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h1 className="font-display font-semibold text-2xl mb-3">Connecte-toi pour publier</h1>
        <p className="text-lo mb-6">
          Il faut un compte Nestor Market pour publier une demande ou une offre — ça évite les fausses annonces.
        </p>
        <Link
          href="/connexion?next=/publier"
          className="inline-block px-5 py-2.5 rounded-md bg-amber text-ink-900 font-bold text-sm hover:bg-amber-deep transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="font-mono text-xs tracking-widest uppercase text-amber mb-2">Nouvelle annonce</div>
      <h1 className="font-display font-semibold text-3xl mb-2">Qu&apos;est-ce que tu veux, ou qu&apos;est-ce que tu vends ?</h1>
      <p className="text-lo mb-8 leading-relaxed">
        Une demande ou une offre, ça prend deux minutes. Sois précis, ça aide la bonne personne à te trouver.
      </p>
      <PublishForm userId={user.id} />
    </div>
  );
        }
