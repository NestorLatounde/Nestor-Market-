"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/constants";
import type { Message } from "@/lib/types";

export default function MessageThread({
  listingId,
  initialMessages,
  currentUserId,
}: {
  listingId: string;
  initialMessages: Message[];
  currentUserId: string | null;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${listingId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `listing_id=eq.${listingId}` },
        async (payload) => {
          const newMsg = payload.new as Message;
          // Récupère le prénom associé (non inclus dans l'évènement realtime brut)
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", newMsg.sender_id)
            .single();
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id)
              ? prev
              : [...prev, { ...newMsg, profiles: profile ? { display_name: profile.display_name } : null }]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !currentUserId) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      listing_id: listingId,
      sender_id: currentUserId,
      body: draft.trim(),
    });
    setSending(false);
    if (!error) setDraft("");
  }

  return (
    <div className="border border-line rounded-2xl bg-ink-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-line font-display font-semibold">Discussion sur cette annonce</div>

      <div className="p-5 flex flex-col gap-3 min-h-[140px] max-h-[420px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="m-auto text-sm text-lo text-center">
            Aucun message pour l&apos;instant. Présente-toi et dis ce qui t&apos;intéresse.
          </div>
        ) : (
          messages.map((m) => {
            const isMe = currentUserId && m.sender_id === currentUserId;
            const author = m.profiles?.display_name ?? "Utilisateur";
            return (
              <div key={m.id} className={`max-w-[82%] ${isMe ? "self-end" : "self-start"}`}>
                <div
                  className={`rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                    isMe ? "bg-amber text-ink-900" : "bg-ink-700 text-hi"
                  }`}
                >
                  {m.body}
                </div>
                <div className={`text-[0.68rem] text-lo mt-1 font-mono ${isMe ? "text-right" : "text-left"}`}>
                  {author} · {formatTime(m.created_at)}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-line p-4">
        {currentUserId ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Écris ton message…"
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-line-strong bg-ink-900 text-hi placeholder:text-lo text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="px-4 rounded-lg bg-amber text-ink-900 disabled:bg-line-strong disabled:text-lo flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </form>
        ) : (
          <div className="text-sm text-lo text-center">
            <Link href={`/connexion?next=/annonce/${listingId}`} className="text-amber font-semibold hover:underline">
              Connecte-toi
            </Link>{" "}
            pour répondre à cette annonce.
          </div>
        )}
      </div>
    </div>
  );
                                      }
