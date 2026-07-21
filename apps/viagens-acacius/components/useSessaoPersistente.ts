"use client";
// Camada de sessão INVISÍVEL ao FichaInterativa e ao motor: tem a MESMA interface do
// useState ([estado, setEstado]), mas empurra o estado pro banco em background.
//
// Pino 3 — sync de fundo, não roundtrip:
//   · o estado LOCAL é a verdade durante a sessão (o motor já rodou, a tela está certa);
//   · a escrita NUNCA relê nada de volta → sem pisca/reverte;
//   · debounce ~2s: mudanças em cadeia (dano repetido, condições) viram UMA escrita após a quietude;
//   · last-write-wins do cliente: escritas são serializadas (uma por vez) e, ao terminar, se o
//     estado mudou durante o await, regrava o mais novo — um "ok" atrasado nunca reverte, e a
//     escrita antiga nunca vence a nova (converge sempre no último; `gravada` evita no-op).

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { EstadoDeSessao } from "@ct/compendio";
import { salvarSessao } from "@/lib/acoes-sessao";

const DEBOUNCE_MS = 2000;

export function useSessaoPersistente(
  inicial: EstadoDeSessao,
  campanhaId: string,
  personagemId: string,
): [EstadoDeSessao, Dispatch<SetStateAction<EstadoDeSessao>>] {
  const [sessao, setSessao] = useState(inicial);
  const ultima = useRef(sessao); // o estado mais novo, sempre
  const gravada = useRef<EstadoDeSessao | null>(null); // último snapshot já persistido
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const escrevendo = useRef(false);
  const montou = useRef(false);

  useEffect(() => {
    ultima.current = sessao;
    if (!montou.current) {
      montou.current = true; // não grava o estado INICIAL (veio do banco; nada mudou)
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void sincronizar(), DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [sessao]);

  async function sincronizar() {
    if (escrevendo.current) return; // serializa: uma escrita por vez
    escrevendo.current = true;
    try {
      let alvo = ultima.current;
      while (alvo !== gravada.current) {
        await salvarSessao(campanhaId, personagemId, alvo); // server action (grava sob RLS do dono)
        gravada.current = alvo;
        alvo = ultima.current; // mudou durante o await? regrava o mais novo (converge)
      }
    } catch (e) {
      // FALHA ALTA, nunca silenciosa — a tela segue com o estado local (correto); só o sync falhou.
      console.error("[sessão] falha ao salvar no banco:", e);
    } finally {
      escrevendo.current = false;
    }
  }

  return [sessao, setSessao];
}
