// Cliente Supabase do SERVIDOR (Server Components / Server Actions) — lê a sessão do
// USUÁRIO pelo COOKIE (padrão @supabase/ssr vigente: getAll/setAll). NUNCA service_role no
// caminho de request. É a única camada que fala com o Auth; o motor/FichaInterativa não veem.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import WebSocketImpl from "ws";

// Node <22 não tem WebSocket nativo; o supabase-js inicializa o realtime na construção.
// (Só no runtime Node — o middleware roda no Edge, que já tem WebSocket, e não importa isto.)
// @ts-expect-error polyfill de ambiente
globalThis.WebSocket ??= WebSocketImpl;

export async function criarClienteServidor() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Chamado de um Server Component (não pode escrever cookie) — ok, o middleware renova.
          }
        },
      },
    },
  );
}
