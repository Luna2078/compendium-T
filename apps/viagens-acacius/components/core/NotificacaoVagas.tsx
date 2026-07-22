"use client";
// NOTIFICAÇÃO AGREGADA (pino 8) — UM selo só no cabeçalho, que troca de forma NO MESMO LUGAR:
// recolhido ("a escolher · N") ⇄ detalhe ("◇ Falta escolher: 1 poder, 1 magia"). Nunca os dois
// ao mesmo tempo. N = f.vagas.length e bate com a soma do detalhe (conta objetos-vaga).
// Pino 9: se não há vaga, não renderiza (a tela mostra f.vagas, não inventa pendência).
import { useState } from "react";
import type { Vaga } from "@ct/motor";

const SINGULAR: Record<string, string> = { poder: "poder", pericia: "perícia", atributo: "atributo", magia: "magia", escolha: "escolha" };
const PLURAL: Record<string, string> = { poder: "poderes", pericia: "perícias", atributo: "atributos", magia: "magias", escolha: "escolhas" };

function dominio(v: Vaga): string {
  if (v.alvo.startsWith("poder:")) return "poder";
  if (v.alvo.startsWith("pericia:")) return "pericia";
  if (v.alvo === "atr:*" || v.alvo.startsWith("atr")) return "atributo";
  if (v.alvo.startsWith("slot:") && v.elegiveis.modo === "criterio" && v.elegiveis.consulta?.alvoTipo === "atributo") return "atributo";
  return "escolha";
}

export function NotificacaoVagas({ vagas }: { vagas: Vaga[] }) {
  const [aberto, setAberto] = useState(false);
  if (vagas.length === 0) return null; // sem vaga → some (não antecipa pendência)

  const n = vagas.length; // = f.vagas.length
  const contagem = new Map<string, number>();
  for (const v of vagas) contagem.set(dominio(v), (contagem.get(dominio(v)) ?? 0) + 1);
  const grupos = [...contagem.entries()]; // soma dos .n bate com n (mesma fonte)

  return (
    <button type="button" className={`notif-vagas${aberto ? " notif-vagas--aberto" : ""}`} onClick={() => setAberto((a) => !a)} aria-expanded={aberto}>
      {aberto ? (
        <>
          <span className="notif-vagas__tit">◇ Falta escolher</span>
          {grupos.map(([dom, q]) => (
            <span className="notif-vagas__grupo" key={dom}>
              <b>{q}</b>{q === 1 ? SINGULAR[dom] : PLURAL[dom]}
            </span>
          ))}
          <span className="notif-vagas__chev">▴</span>
        </>
      ) : (
        <>
          <span className="notif-vagas__rot">a escolher</span>
          <span className="notif-vagas__n">{n}</span>
          <span className="notif-vagas__chev">▾</span>
        </>
      )}
    </button>
  );
}
