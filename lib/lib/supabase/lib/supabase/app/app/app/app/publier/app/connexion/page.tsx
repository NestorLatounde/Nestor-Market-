import ConnexionForm from "@/components/ConnexionForm";

export default function ConnexionPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="font-mono text-xs tracking-widest uppercase text-amber mb-2">Connexion</div>
      <h1 className="font-display font-semibold text-2xl mb-3">Rejoins Nestor Market</h1>
      <p className="text-lo mb-8 leading-relaxed">
        Pas de mot de passe à retenir : on t&apos;envoie un lien de connexion par e-mail.
      </p>
      <ConnexionForm next={searchParams.next ?? "/"} />
    </div>
  );
      }
