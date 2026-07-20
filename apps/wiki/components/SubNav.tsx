import Link from "next/link";

/** Navegação entre as sub-páginas de uma seção (chips dos grupos + voltar ao menu). */
export function SubNav({
  base,
  itens,
  atual,
  voltarRotulo = "Todos",
}: {
  base: string;
  itens: { slug: string; rotulo: string }[];
  atual: string;
  voltarRotulo?: string;
}) {
  return (
    <nav className="sub-nav" aria-label="Navegação da seção">
      <Link href={base} className="sub-nav-voltar">← {voltarRotulo}</Link>
      {itens.map((i) => (
        <Link key={i.slug} href={`${base}/${i.slug}`} className={i.slug === atual ? "sub-nav-ativo" : undefined}>
          {i.rotulo}
        </Link>
      ))}
    </nav>
  );
}
