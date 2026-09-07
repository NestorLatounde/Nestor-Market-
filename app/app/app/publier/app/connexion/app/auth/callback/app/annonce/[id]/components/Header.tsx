import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import SignOutButton from "@/components/SignOutButton";

export default function Header({ user }: { user: User | null }) {
  return (
    <div className="sticky top-0 z-20 border-b border-line bg-ink-900/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <span className="w-7 h-7 rounded-md bg-amber text-ink-900 flex items-center justify-center text-sm">N</span>
          Nestor Market
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/publier"
            className="px-4 py-2 rounded-md bg-amber text-ink-900 font-bold text-sm hover:bg-amber-deep transition-colors"
          >
            Publier une annonce
          </Link>

          {user ? (
            <SignOutButton />
          ) : (
            <Link
              href="/connexion"
              className="px-4 py-2 rounded-md border border-line-strong text-hi font-semibold text-sm hover:border-amber hover:text-amber transition-colors"
            >
              Se connecter
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
