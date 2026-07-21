"use client";
// Cliente Supabase do BROWSER — usado nas telas de login/signup. Sessão via cookie
// (createBrowserClient cuida disso). Sem service_role, sem segredo.
import { createBrowserClient } from "@supabase/ssr";

export function criarClienteBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
