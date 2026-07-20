"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIAS, areaDoPath } from "@/lib/navegacao";
import { Logo } from "./Logo";

/** Coluna esquerda: logo + busca + categorias, com a área atual destacada. */
export function NavGlobal() {
  const pathname = usePathname() ?? "/";
  const area = areaDoPath(pathname);
  return (
    <nav className="nav-global" aria-label="Navegação principal">
      <Logo />
      <div className="nav-cats">
        {CATEGORIAS.map((c) => {
          const ativo = c.id === area;
          return (
            <Link
              key={c.id}
              href={c.rota}
              className={`nav-cat${ativo ? " nav-cat-ativo" : ""}`}
              aria-current={ativo ? "page" : undefined}
            >
              {c.rotulo}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
