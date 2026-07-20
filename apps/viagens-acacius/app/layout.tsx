// Layout raiz mínimo — exigido pelo App Router. Sem estilo (Etapa 1 é feia de propósito).
export const metadata = {
  title: "Viagens Acácius",
  description: "Ficha de personagem — Tormenta 20",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
