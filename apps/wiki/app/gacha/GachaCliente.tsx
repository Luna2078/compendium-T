"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { DadosGacha, ResultadoSorteio } from "@/lib/gacha/tipos";
import { sortear, sortearCoringa } from "@/lib/gacha/tipos";

// Cores de aura por faixa (momento de revelação; fora do chrome do shell).
const CORES_RARIDADE: Record<string, { cor: string; brilho: string }> = {
  Comum: { cor: "#8a8175", brilho: "rgba(138,129,117,0.55)" },
  Incomum: { cor: "#2f9e6f", brilho: "rgba(47,158,111,0.6)" },
  Raro: { cor: "#3a7bd5", brilho: "rgba(58,123,213,0.65)" },
  Épico: { cor: "#b0388f", brilho: "rgba(176,56,143,0.7)" },
  Lendário: { cor: "#e0913a", brilho: "rgba(224,145,58,0.78)" },
};
const corRaridade = (r: string) => CORES_RARIDADE[r] ?? CORES_RARIDADE.Comum;

// Rótulo/cor por tipo de modificação.
const ROTULO_MOD: Record<string, { rotulo: string; cor: string }> = {
  melhoria: { rotulo: "Melhoria", cor: "#7a1320" },
  material: { rotulo: "Material", cor: "#3a5a40" },
  encanto: { rotulo: "Encanto", cor: "#b0388f" },
};

function Icone({ chave, cor }: { chave: string; cor: string }) {
  const props = { width: 40, height: 40, viewBox: "0 0 24 24", fill: "none", stroke: cor, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (chave) {
    case "armas":
      return <svg {...props}><path d="M14.5 3.5 21 10l-2 2-6.5-6.5zM12 7 4 15l-1.5 4.5L7 18l8-8" /><path d="M16 13l5 5-2 2-5-5" /></svg>;
    case "armadura":
      return <svg {...props}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M12 8v8" /></svg>;
    case "consumiveis":
      return <svg {...props}><path d="M9 3h6M10 3v4l-3.5 9a3 3 0 0 0 2.8 4h5.4a3 3 0 0 0 2.8-4L14 7V3" /><path d="M7.5 14h9" /></svg>;
    case "suprimentos":
      return <svg {...props}><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v8l9 4 9-4V7" /><path d="M12 11v8" /></svg>;
    case "coringa":
      return <svg {...props}><path d="M12 2l2.5 5.5L20 8l-4 4 1 6-5-3-5 3 1-6L4 8l5.5-.5z" /></svg>;
    default:
      return null;
  }
}

interface Banner { chave: string; rotulo: string; coringa?: boolean }

// Aplica a calibração do mestre salva no navegador (odds, composição, tetos) sobre os dados do build.
function aplicarOverridesMestre(dados: DadosGacha): DadosGacha {
  try {
    const raw = localStorage.getItem("gacha-mestre-config");
    if (!raw) return dados;
    const c = JSON.parse(raw) as {
      pesosDrop?: Record<string, number>;
      chanceComPronto?: number;
      maxMelhorias?: number;
      maxEncantos?: number;
      modsPorFaixa?: Record<string, { min: number; max: number }>;
    };
    return {
      ...dados,
      pesosDrop: c.pesosDrop ?? dados.pesosDrop,
      categorias: dados.categorias.map((cat) => ({
        ...cat,
        chanceComPronto: c.chanceComPronto ?? cat.chanceComPronto,
        maxMelhorias: c.maxMelhorias ?? cat.maxMelhorias,
        maxEncantos: c.maxEncantos ?? cat.maxEncantos,
        modsPorFaixa: c.modsPorFaixa ?? cat.modsPorFaixa,
      })),
    };
  } catch {
    return dados;
  }
}

export function GachaCliente({ dados }: { dados: DadosGacha }) {
  const [estado, setEstado] = useState<"escolha" | "sorteando" | "revelado">("escolha");
  const [bannerAtivo, setBannerAtivo] = useState<Banner | null>(null);
  const [resultado, setResultado] = useState<ResultadoSorteio | null>(null);
  const [historico, setHistorico] = useState<ResultadoSorteio[]>([]);

  const banners: Banner[] = [
    ...dados.categorias.map((c) => ({ chave: c.chave, rotulo: c.rotulo })),
    { chave: "coringa", rotulo: dados.coringa.rotulo, coringa: true },
  ];

  // Histórico persistido no navegador. 'prontoHist' (estado) impede o save de clobberar o cache
  // com [] antes do load rodar ao (re)montar (corrida agravada pelo StrictMode).
  const [prontoHist, setProntoHist] = useState(false);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- carga única do histórico persistido */
    try {
      const raw = localStorage.getItem("gacha-historico");
      if (raw) setHistorico(JSON.parse(raw));
    } catch { /* ignora */ }
    setProntoHist(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!prontoHist) return;
    try {
      localStorage.setItem("gacha-historico", JSON.stringify(historico));
    } catch { /* ignora */ }
  }, [prontoHist, historico]);

  // Rever um item do histórico (sem re-sortear).
  function rever(res: ResultadoSorteio) {
    setBannerAtivo(res.viaCoringa ? banners.find((b) => b.coringa) ?? null : banners.find((b) => b.chave === res.categoria) ?? null);
    setResultado(res);
    setEstado("revelado");
  }

  function puxar(banner: Banner) {
    // Modo mestre: rolagem dirigida (escondida do player), armada no Painel do Mestre.
    let forcar: string | undefined;
    try {
      const raw = localStorage.getItem("gacha-dirigido");
      if (raw) {
        const d = JSON.parse(raw) as { categoria: string; faixa: string };
        const alvo = banner.coringa ? "coringa" : banner.chave;
        if (d.categoria === alvo) {
          forcar = d.faixa;
          localStorage.removeItem("gacha-dirigido"); // consome uma vez
        }
      }
    } catch { /* ignora */ }
    const d = aplicarOverridesMestre(dados);
    const res = banner.coringa ? sortearCoringa(d, forcar) : sortear(d, banner.chave, 0, forcar);
    if (!res) return;
    setBannerAtivo(banner);
    setResultado(res);
    setEstado("sorteando");
    setTimeout(() => {
      setEstado("revelado");
      setHistorico((h) => [res, ...h].slice(0, 12));
    }, 1300);
  }

  function voltar() {
    setEstado("escolha");
    setBannerAtivo(null);
    setResultado(null);
  }

  return (
    <main className="folha-main">
      <div className="folha">
        <motion.div whileHover={{ opacity: 1 }} style={{ position: "absolute", top: 12, right: 14, opacity: 0.3 }}>
          <Link href="/gacha/mestre" title="Painel do Mestre" aria-label="Painel do Mestre" style={{ color: "var(--tinta-suave)", display: "block" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </motion.div>
        <h1 className="titulo-grimorio" style={{ fontSize: 46, textAlign: "center" }}>Gacha de Arton</h1>
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", margin: "10px 0 24px", fontFamily: "var(--serifa)" }}>
          Escolha um e tente a sorte.
        </p>

        <AnimatePresence mode="wait">
          {estado === "escolha" && (
            <motion.div key="escolha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {banners.map((b) => {
                  const corBanner = b.coringa ? "#e0913a" : "var(--carmesim)";
                  return (
                    <motion.button
                      key={b.chave}
                      onClick={() => puxar(b)}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        textAlign: "center", cursor: "pointer", padding: "22px 16px",
                        borderRadius: 14, border: `1.5px solid ${b.coringa ? "#e0913a" : "var(--borda-suave)"}`,
                        background: b.coringa
                          ? "linear-gradient(180deg, rgba(224,145,58,0.12), rgba(176,56,143,0.10))"
                          : "rgba(255,250,240,0.32)",
                        color: "var(--tinta)",
                      }}
                    >
                      <Icone chave={b.chave} cor={corBanner} />
                      <span style={{ fontFamily: "var(--font-tormenta), var(--serifa)", fontSize: 23, color: b.coringa ? "#b65d12" : "var(--carmesim)" }}>{b.rotulo}</span>
                    </motion.button>
                  );
                })}
              </div>

              {historico.length > 0 && (
                <div style={{ marginTop: 30 }}>
                  <div style={{ fontFamily: "var(--serifa)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--vermelho)", marginBottom: 8 }}>Últimos sorteios <span style={{ textTransform: "none", letterSpacing: 0, opacity: 0.6 }}>(clique para rever)</span></div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {historico.map((h, i) => (
                      <motion.button key={i} onClick={() => rever(h)} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
                        title={`Rever ${h.item.nome}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "var(--serifa)", fontSize: 12, padding: "4px 11px", borderRadius: 20, border: `1px solid ${corRaridade(h.faixaEntregue).cor}`, color: "var(--tinta)", background: "rgba(255,250,240,0.4)" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: corRaridade(h.faixaEntregue).cor }} />
                        {h.item.nome}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {(estado === "sorteando" || estado === "revelado") && resultado && (
            <motion.div key="resultado" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: 380, justifyContent: "center" }}>
              {estado === "sorteando" && (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0.3 }}
                  animate={{ scale: [0.8, 1.15, 0.95], opacity: 1, rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 1.3, ease: "easeInOut" }}
                  style={{ width: 150, height: 150, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: `radial-gradient(circle, ${bannerAtivo?.coringa ? "rgba(224,145,58,0.5)" : "rgba(176,56,143,0.45)"}, transparent 70%)`,
                    boxShadow: `0 0 60px ${bannerAtivo?.coringa ? "rgba(224,145,58,0.6)" : "rgba(176,56,143,0.55)"}` }}
                >
                  <Icone chave={bannerAtivo?.chave ?? "coringa"} cor="#fff" />
                </motion.div>
              )}

              {estado === "revelado" && <RevelacaoCard resultado={resultado} escala={dados.escalaRaridade} />}

              {estado === "revelado" && (
                <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => bannerAtivo && puxar(bannerAtivo)}
                    style={{ cursor: "pointer", fontFamily: "var(--serifa)", fontSize: 14, padding: "9px 20px", borderRadius: 22, border: "none", background: "var(--carmesim)", color: "#fff" }}>
                    Sortear de novo
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={voltar}
                    style={{ cursor: "pointer", fontFamily: "var(--serifa)", fontSize: 14, padding: "9px 20px", borderRadius: 22, border: "1px solid var(--borda-suave)", background: "transparent", color: "var(--tinta)" }}>
                    Trocar de portão
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function RevelacaoCard({ resultado, escala }: { resultado: ResultadoSorteio; escala: string[] }) {
  const { cor, brilho } = corRaridade(resultado.faixaEntregue);
  const subiu = resultado.viaCoringa && escala.indexOf(resultado.faixaEntregue) > escala.indexOf(resultado.faixaSorteada);
  const deficit = escala.indexOf(resultado.faixaEntregue) < escala.indexOf(resultado.faixaAlvo);
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0, rotateY: 90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      style={{ position: "relative", width: 440, maxWidth: "92vw", padding: "28px 30px", borderRadius: 16, textAlign: "center",
        border: `2px solid ${cor}`, background: "rgba(255,250,240,0.55)", boxShadow: `0 0 50px ${brilho}, inset 0 0 26px ${brilho}` }}
    >
      <motion.div aria-hidden animate={{ opacity: [0.25, 0.6, 0.25] }} transition={{ duration: 2.4, repeat: Infinity }}
        style={{ position: "absolute", inset: -2, borderRadius: 16, boxShadow: `0 0 40px ${brilho}`, pointerEvents: "none" }} />

      <div style={{ display: "inline-block", padding: "3px 14px", borderRadius: 20, background: cor, color: "#fff", fontFamily: "var(--serifa)", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
        {resultado.faixaEntregue}
      </div>
      <div style={{ margin: "16px 0 6px", fontFamily: "var(--font-tormenta), var(--serifa)", fontSize: 25, color: "var(--carmesim)", lineHeight: 1.15 }}>
        {resultado.item.nome}
      </div>
      <div style={{ fontFamily: "var(--serifa)", fontSize: 12.5, color: "var(--tinta-suave)", textTransform: "capitalize" }}>
        {resultado.rotulo} · {resultado.item.categoriaItem}{resultado.item.magico ? " (mágico)" : ""}
      </div>

      {/* status mecânicos — rótulo→valor, sem caixas */}
      {resultado.item.stats && resultado.item.stats.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "5px 18px", margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--borda-suave)" }}>
          {resultado.item.stats.map((s, i) => (
            <span key={i} style={{ fontFamily: "var(--serifa)", fontSize: 13.5, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: "var(--vermelho)" }}>{s.rotulo} </span>
              <strong style={{ color: "var(--tinta)" }}>{s.valor}</strong>
            </span>
          ))}
        </div>
      )}
      {(resultado.item.especial || resultado.item.resumo) && (
        <p style={{ margin: "12px 0 0", fontFamily: "var(--serifa)", fontSize: 12.5, color: "var(--tinta-suave)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {resultado.item.especial || resultado.item.resumo}
        </p>
      )}

      {/* o que cada modificação acrescenta (composição) */}
      {resultado.composto && resultado.modificadores.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--borda-suave)", textAlign: "left" }}>
          <div style={{ fontFamily: "var(--serifa)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--vermelho)", marginBottom: 6 }}>Modificações</div>
          {resultado.modificadores.map((m) => (
            <div key={m.id} style={{ marginBottom: 7, fontFamily: "var(--serifa)", fontSize: 12.5, color: "var(--tinta)", display: "grid", gridTemplateColumns: "70px 1fr", gap: 10, alignItems: "baseline" }}>
              <span style={{ textAlign: "center", fontSize: 8.5, letterSpacing: 0.5, textTransform: "uppercase", color: "#fff", background: ROTULO_MOD[m.tipo].cor, borderRadius: 4, padding: "2px 0" }}>{ROTULO_MOD[m.tipo].rotulo}</span>
              <span style={{ lineHeight: 1.4 }}><strong style={{ color: "var(--carmesim)" }}>{m.nome}</strong> <span style={{ color: "var(--tinta-suave)" }}>— {m.efeito}</span></span>
            </div>
          ))}
        </div>
      )}

      {subiu && (
        <div style={{ marginTop: 12, fontFamily: "var(--serifa)", fontSize: 12, color: "#b65d12", fontWeight: 700 }}>
          Coringa! Subiu de {resultado.faixaSorteada} → {resultado.faixaEntregue}
        </div>
      )}
      {deficit && (
        <div style={{ marginTop: 8, fontFamily: "var(--serifa)", fontSize: 11.5, color: "#b65d12", fontStyle: "italic" }}>
          Sem item na faixa {resultado.faixaAlvo} desta categoria — entregue {resultado.faixaEntregue}
        </div>
      )}

      <Link href={`/ficha/${resultado.item.magico ? "item-magico" : "item"}/${resultado.item.id}`}
        style={{ display: "inline-block", marginTop: 14, fontFamily: "var(--serifa)", fontSize: 12.5, color: "var(--carmesim)", textDecoration: "none", borderBottom: "1px solid var(--borda-suave)" }}>
        ver no compêndio →
      </Link>
    </motion.div>
  );
}
