import type { NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase/middleware";

// Next 16 renomeou a convenção `middleware` → `proxy` (mesma função de borda, mesmo matcher).
// Aqui só refrescamos a sessão do cookie e barramos rota protegida sem login.
export async function proxy(request: NextRequest) {
  return atualizarSessao(request);
}

// roda em tudo, menos assets estáticos e o favicon
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
