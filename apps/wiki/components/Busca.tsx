"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { buscar, construirIndice, type ItemIndice } from "@/lib/busca";

export function Busca() {
  const [q, setQ] = useState("");
  const [itens, setItens] = useState<ItemIndice[]>([]);
  useEffect(() => {
    let vivo = true;
    fetch("/busca-indice.json")
      .then((r) => r.json())
      .then((dados: ItemIndice[]) => { if (vivo) setItens(dados); })
      .catch(() => {});
    return () => { vivo = false; };
  }, []);
  const indice = useMemo(() => construirIndice(itens), [itens]);
  const resultados = useMemo(() => buscar(q, indice).slice(0, 20), [q, indice]);
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar em Arton…"
        style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "var(--busca-fundo)", border: "1px solid var(--vermelho)", color: "var(--texto-casca)", fontSize: 16, fontFamily: "var(--serifa)" }}
      />
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        {resultados.map((r: ItemIndice, i) => (
          <motion.div key={r.tipo + r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
            <Link href={`/ficha/${r.tipo}/${r.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, background: "var(--pergaminho-1)", border: "1px solid var(--borda-suave)", color: "var(--tinta)", textDecoration: "none" }}>
              <strong style={{ fontFamily: "var(--font-tormenta), var(--serifa)", color: "var(--carmesim)", letterSpacing: ".3px" }}>{r.nome}</strong>
              <span style={{ flexShrink: 0, fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: "var(--pergaminho-1)", background: "var(--carmesim-escuro)", borderRadius: 12, padding: "2px 9px", fontWeight: 700 }}>{r.tipo}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
