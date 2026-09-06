"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 rounded-md border border-line-strong text-lo font-semibold text-sm hover:border-amber hover:text-amber transition-colors"
    >
      Se déconnecter
    </button>
  );
}
