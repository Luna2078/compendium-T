import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Os pacotes do monorepo são consumidos como TS-fonte (sem build próprio), então o Next
  // os transpila junto do app — mesmo padrão da wiki, agora incluindo o motor.
  transpilePackages: ["@ct/compendio", "@ct/motor", "@ct/persistencia"],
  // ws (addons nativos opcionais) e supabase-js ficam EXTERNOS ao bundle do servidor —
  // o Next os `require()` em runtime (Node), em vez de bundlar. Sem isto, `next build` quebra
  // no import do ws. É só server-side (a leitura do banco), nunca vai pro cliente.
  serverExternalPackages: ["ws", "@supabase/supabase-js", "@supabase/ssr"],
  // ⚠️ SEM `output: "export"` (a wiki usa; aqui não). A wiki é conteúdo READ-ONLY, gerado
  // estático. A ficha é STATEFUL: a Etapa 3 (toggle da Fúria recalculando) precisa recompor
  // a ficha, o que — nesta arquitetura servidor-side — pede um servidor vivo (server action
  // ou rota dinâmica), não HTML congelado. Deixar aberto agora evita refatorar depois.
};

export default nextConfig;
