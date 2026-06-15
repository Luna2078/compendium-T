"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DadosGacha, OrcamentoFaixa } from "@/lib/gacha/tipos";
import { sortear, sortearCoringa } from "@/lib/gacha/tipos";

const CORES: Record<string, string> = {
  Comum: "#8a8175", Incomum: "#2f9e6f", Raro: "#3a7bd5", "Épico": "#b0388f", "Lendário": "#e0913a",
};

const num = (v: unknown, fb = 0): number => (Number.isFinite(Number(v)) ? Number(v) : fb);

export function MestreCliente({ dados, config }: { dados: DadosGacha; config: Record<string, unknown> }) {
  const escala = dados.escalaRaridade;
  const pesosRaw = config.pesosDrop as Record<string, unknown>;
  const comp = (config.composicao ?? {}) as { chanceComPronto?: number; maxMelhorias?: number; maxEncantos?: number; modsPorFaixa?: Record<string, OrcamentoFaixa> };

  const [pesos, setPesos] = useState<Record<string, number>>(() => Object.fromEntries(escala.map((f) => [f, num(pesosRaw[f])])));
  const [chance, setChance] = useState<number>(num(comp.chanceComPronto, 0));
  const [maxMel, setMaxMel] = useState<number>(num(comp.maxMelhorias, 4));
  const [maxEnc, setMaxEnc] = useState<number>(num(comp.maxEncantos, 3));
  const [mods, setMods] = useState<Record<string, OrcamentoFaixa>>(() =>
    Object.fromEntries(escala.map((f) => [f, { min: num(comp.modsPorFaixa?.[f]?.min), max: num(comp.modsPorFaixa?.[f]?.max) }])),
  );
  const [dist, setDist] = useState<Record<string, Record<string, number>> | null>(null);
  const [salvo, setSalvo] = useState<string>("");

  // ── Persistência da calibração no navegador (vale no /gacha deste aparelho, sem precisar do JSON) ──
  // 'prontoCfg' (estado, não ref) impede o efeito de salvar de rodar ANTES do carregar — evita
  // gravar os valores-padrão por cima do cache ao (re)montar (corrida agravada pelo StrictMode).
  const [prontoCfg, setProntoCfg] = useState(false);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- restaura a config salva pelo mestre, uma vez */
    try {
      const raw = localStorage.getItem("gacha-mestre-config");
      if (raw) {
        const c = JSON.parse(raw) as { pesosDrop?: Record<string, number>; chanceComPronto?: number; maxMelhorias?: number; maxEncantos?: number; modsPorFaixa?: Record<string, OrcamentoFaixa> };
        if (c.pesosDrop) setPesos((p) => ({ ...p, ...c.pesosDrop }));
        if (typeof c.chanceComPronto === "number") setChance(c.chanceComPronto);
        if (typeof c.maxMelhorias === "number") setMaxMel(c.maxMelhorias);
        if (typeof c.maxEncantos === "number") setMaxEnc(c.maxEncantos);
        if (c.modsPorFaixa) setMods((m) => ({ ...m, ...c.modsPorFaixa }));
      }
    } catch { /* ignora */ }
    setProntoCfg(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  function salvarNavegador(aviso = true) {
    try {
      localStorage.setItem("gacha-mestre-config", JSON.stringify({ pesosDrop: pesos, chanceComPronto: chance, maxMelhorias: maxMel, maxEncantos: maxEnc, modsPorFaixa: mods }));
      if (aviso) setSalvo("Salvo no navegador!");
    } catch { /* ignora */ }
  }
  useEffect(() => {
    if (!prontoCfg) return; // só salva depois que o carregar populou o estado
    try {
      localStorage.setItem("gacha-mestre-config", JSON.stringify({ pesosDrop: pesos, chanceComPronto: chance, maxMelhorias: maxMel, maxEncantos: maxEnc, modsPorFaixa: mods }));
    } catch { /* ignora */ }
  }, [prontoCfg, pesos, chance, maxMel, maxEnc, mods]);

  function restaurarPadrao() {
    try { localStorage.removeItem("gacha-mestre-config"); } catch { /* ignora */ }
    setPesos(Object.fromEntries(escala.map((f) => [f, num(pesosRaw[f])])));
    setChance(num(comp.chanceComPronto, 0));
    setMaxMel(num(comp.maxMelhorias, 4));
    setMaxEnc(num(comp.maxEncantos, 3));
    setMods(Object.fromEntries(escala.map((f) => [f, { min: num(comp.modsPorFaixa?.[f]?.min), max: num(comp.modsPorFaixa?.[f]?.max) }])));
  }

  // ── Sorteio dirigido (escondido do player; comunica com /gacha via localStorage) ──
  const portoes = [...dados.categorias.map((c) => ({ chave: c.chave, rotulo: c.rotulo })), { chave: "coringa", rotulo: dados.coringa.rotulo }];
  const [dCat, setDCat] = useState<string>(portoes[0]?.chave ?? "armas");
  const [dFaixa, setDFaixa] = useState<string>(escala[escala.length - 1]);
  const [armado, setArmado] = useState<{ categoria: string; faixa: string } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("gacha-dirigido");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do estado armado
      if (raw) setArmado(JSON.parse(raw));
    } catch { /* ignora */ }
  }, []);
  function armar() {
    const v = { categoria: dCat, faixa: dFaixa };
    try { localStorage.setItem("gacha-dirigido", JSON.stringify(v)); } catch { /* ignora */ }
    setArmado(v);
  }
  function desarmar() {
    try { localStorage.removeItem("gacha-dirigido"); } catch { /* ignora */ }
    setArmado(null);
  }
  const rotuloPortao = (chave: string) => portoes.find((p) => p.chave === chave)?.rotulo ?? chave;

  // DadosGacha em memória com as edições aplicadas (para preview).
  const previewDados: DadosGacha = useMemo(
    () => ({ ...dados, pesosDrop: pesos, categorias: dados.categorias.map((c) => ({ ...c, chanceComPronto: chance, maxMelhorias: maxMel, maxEncantos: maxEnc, modsPorFaixa: mods })) }),
    [dados, pesos, chance, maxMel, maxEnc, mods],
  );

  function simular() {
    const N = 2000;
    const chaves = [...dados.categorias.map((c) => c.chave), "coringa"];
    const out: Record<string, Record<string, number>> = {};
    for (const cat of chaves) {
      const cont = Object.fromEntries(escala.map((f) => [f, 0]));
      for (let i = 0; i < N; i++) {
        const r = cat === "coringa" ? sortearCoringa(previewDados) : sortear(previewDados, cat);
        if (r) cont[r.faixaEntregue]++;
      }
      out[cat] = Object.fromEntries(escala.map((f) => [f, Math.round((cont[f] / N) * 1000) / 10]));
    }
    setDist(out);
  }

  const configEditado = useMemo(() => {
    const novo = structuredClone(config) as Record<string, unknown>;
    novo.pesosDrop = { ...(novo.pesosDrop as Record<string, unknown>), ...pesos };
    novo.composicao = { ...(novo.composicao as Record<string, unknown>), chanceComPronto: chance, maxMelhorias: maxMel, maxEncantos: maxEnc, modsPorFaixa: mods };
    return JSON.stringify(novo, null, 2);
  }, [config, pesos, chance, maxMel, maxEnc, mods]);

  function copiar() {
    navigator.clipboard?.writeText(configEditado);
    setSalvo("Copiado!");
  }
  function baixar() {
    const blob = new Blob([configEditado], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Grava direto no arquivo escolhido (File System Access API). Cai pro download se não suportado.
  type Gravavel = { createWritable: () => Promise<{ write: (d: string) => Promise<void>; close: () => Promise<void> }> };
  async function salvarNoArquivo() {
    const w = window as unknown as { showSaveFilePicker?: (o: unknown) => Promise<Gravavel> };
    if (!w.showSaveFilePicker) {
      baixar();
      setSalvo("Baixado (seu navegador não permite gravar direto).");
      return;
    }
    try {
      const handle = await w.showSaveFilePicker({ suggestedName: "config.json", types: [{ description: "JSON", accept: { "application/json": [".json"] } }] });
      const writable = await handle.createWritable();
      await writable.write(configEditado);
      await writable.close();
      setSalvo("Salvo no arquivo! Recarregue o gacha para aplicar.");
    } catch {
      /* usuário cancelou */
    }
  }

  const totalPeso = escala.reduce((s, f) => s + (pesos[f] || 0), 0) || 1;
  const lbl = { fontFamily: "var(--serifa)", fontSize: 12, color: "var(--tinta-suave)" } as const;
  const inp = { width: 64, padding: "4px 7px", fontFamily: "var(--serifa)", fontSize: 13, border: "1px solid var(--borda-suave)", borderRadius: 6, background: "rgba(255,250,240,.6)", color: "var(--tinta)" } as const;

  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 40, textAlign: "center" }}>Painel do Mestre</h1>
        <p style={{ textAlign: "center", margin: "8px 0 4px", ...lbl }}>
          Calibre os pesos e a composição. <Link href="/gacha" style={{ color: "var(--carmesim)" }}>← voltar ao gacha</Link>
        </p>
        <p style={{ textAlign: "center", color: "var(--tinta-suave)", fontSize: 11.5, fontFamily: "var(--serifa)", margin: "0 0 12px" }}>
          As mudanças são <strong>salvas no navegador automaticamente</strong> e já valem no <code>/gacha</code> deste aparelho. Para tornar padrão no site publicado (todos os aparelhos), use <strong>Copiar/Baixar</strong> e suba o <code>config.json</code>.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "0 0 22px" }}>
          <button onClick={() => salvarNavegador(true)} style={{ cursor: "pointer", fontFamily: "var(--serifa)", fontSize: 14, padding: "8px 18px", borderRadius: 22, border: "none", background: "var(--carmesim)", color: "#fff" }}>Salvar no navegador</button>
          <Link href="/gacha" style={{ fontFamily: "var(--serifa)", fontSize: 14, padding: "8px 18px", borderRadius: 22, border: "1px solid var(--carmesim)", color: "var(--carmesim)", textDecoration: "none" }}>Ir para o gacha →</Link>
          {salvo && <span style={{ alignSelf: "center", fontFamily: "var(--serifa)", fontSize: 12, color: "#3a5a40" }}>{salvo}</span>}
        </div>

        {/* SORTEIO DIRIGIDO */}
        <section style={{ margin: "0 0 24px", padding: "14px 16px", border: `1.5px solid ${armado ? "var(--carmesim)" : "var(--borda-suave)"}`, borderRadius: 12, background: armado ? "rgba(155,28,46,0.07)" : "rgba(255,250,240,0.3)" }}>
          <h2 style={{ fontFamily: "var(--font-tormenta), var(--serifa)", color: "var(--carmesim)", fontSize: 20, margin: "0 0 4px" }}>
            Sorteio dirigido <span style={{ fontFamily: "var(--serifa)", fontSize: 12, color: "var(--tinta-suave)" }}>— escondido do player</span>
          </h2>
          <p style={{ ...lbl, margin: "0 0 10px" }}>Arme a próxima rolagem de um portão. O player só clica em rolar no <code>/gacha</code> e sai a qualidade marcada (consome uma vez).</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <select value={dCat} onChange={(e) => setDCat(e.target.value)} style={{ ...inp, width: "auto" }}>
              {portoes.map((p) => <option key={p.chave} value={p.chave}>{p.rotulo}</option>)}
            </select>
            <select value={dFaixa} onChange={(e) => setDFaixa(e.target.value)} style={{ ...inp, width: "auto" }}>
              {escala.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <button onClick={armar} style={{ cursor: "pointer", fontFamily: "var(--serifa)", fontSize: 13, padding: "5px 16px", borderRadius: 18, border: "none", background: "var(--carmesim)", color: "#fff" }}>Armar próximo sorteio</button>
            {armado && <button onClick={desarmar} style={{ cursor: "pointer", fontFamily: "var(--serifa)", fontSize: 13, padding: "5px 14px", borderRadius: 18, border: "1px solid var(--borda-suave)", background: "transparent", color: "var(--tinta)" }}>Desarmar</button>}
          </div>
          {dCat === "coringa" && <p style={{ ...lbl, margin: "8px 0 0", fontStyle: "italic" }}>No Coringa o resultado vem <strong>um patamar acima</strong> do marcado.</p>}
          <div style={{ marginTop: 10, fontFamily: "var(--serifa)", fontSize: 13, color: armado ? "var(--carmesim)" : "var(--tinta-suave)", fontWeight: armado ? 700 : 400 }}>
            {armado ? `▸ Armado: ${rotuloPortao(armado.categoria)} · ${armado.faixa}${armado.categoria === "coringa" ? " (sai acima)" : ""} — próximo clique do player nesse portão.` : "Nada armado — sorteio 100% aleatório."}
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          {/* ODDS */}
          <section>
            <h2 style={{ fontFamily: "var(--font-tormenta), var(--serifa)", color: "var(--carmesim)", fontSize: 20, margin: "0 0 8px" }}>Odds (peso de cada faixa)</h2>
            {escala.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: CORES[f] }} />
                <span style={{ ...lbl, width: 78 }}>{f}</span>
                <input type="number" min={0} value={pesos[f]} onChange={(e) => setPesos({ ...pesos, [f]: num(e.target.value) })} style={inp} />
                <span style={{ ...lbl, width: 52, textAlign: "right" }}>{((pesos[f] / totalPeso) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </section>

          {/* COMPOSIÇÃO */}
          <section>
            <h2 style={{ fontFamily: "var(--font-tormenta), var(--serifa)", color: "var(--carmesim)", fontSize: 20, margin: "0 0 8px" }}>Composição</h2>
            <div style={{ marginBottom: 12 }}>
              <div style={lbl}>Chance de montar mesmo com item pronto: <strong>{Math.round(chance * 100)}%</strong></div>
              <input type="range" min={0} max={1} step={0.05} value={chance} onChange={(e) => setChance(num(e.target.value))} style={{ width: "100%", accentColor: "var(--carmesim)" }} />
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
              <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 6 }}>Máx. melhorias por item
                <input type="number" min={0} value={maxMel} onChange={(e) => setMaxMel(num(e.target.value))} style={{ ...inp, width: 52 }} />
              </label>
              <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 6 }}>Máx. encantos por item
                <input type="number" min={0} value={maxEnc} onChange={(e) => setMaxEnc(num(e.target.value))} style={{ ...inp, width: 52 }} />
              </label>
            </div>
            <div style={{ ...lbl, margin: "0 0 6px", fontStyle: "italic" }}>+1 material por item. Máx. total por item: {maxMel + maxEnc + 1}.</div>
            <div style={{ ...lbl, marginBottom: 4 }}>Modificações por faixa (mín / máx):</div>
            {escala.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ ...lbl, width: 78 }}>{f}</span>
                <input type="number" min={0} value={mods[f].min} onChange={(e) => setMods({ ...mods, [f]: { ...mods[f], min: num(e.target.value) } })} style={{ ...inp, width: 52 }} />
                <span style={lbl}>até</span>
                <input type="number" min={0} value={mods[f].max} onChange={(e) => setMods({ ...mods, [f]: { ...mods[f], max: num(e.target.value) } })} style={{ ...inp, width: 52 }} />
              </div>
            ))}
          </section>
        </div>

        {/* PREVIEW */}
        <section style={{ marginTop: 22 }}>
          <button onClick={simular} style={{ cursor: "pointer", fontFamily: "var(--serifa)", fontSize: 14, padding: "8px 18px", borderRadius: 22, border: "none", background: "var(--carmesim)", color: "#fff" }}>
            Simular 2000 sorteios
          </button>
          {dist && (
            <div style={{ marginTop: 14 }}>
              {Object.entries(dist).map(([cat, d]) => (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ ...lbl, textTransform: "capitalize", marginBottom: 3 }}>{cat}</div>
                  <div style={{ display: "flex", height: 22, borderRadius: 6, overflow: "hidden", border: "1px solid var(--borda-suave)" }}>
                    {escala.map((f) => (d[f] > 0 ? (
                      <div key={f} title={`${f}: ${d[f]}%`} style={{ width: `${d[f]}%`, background: CORES[f], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, color: "#fff", fontFamily: "var(--serifa)" }}>
                        {d[f] >= 7 ? `${d[f]}%` : ""}
                      </div>
                    ) : null))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* EXPORTAR */}
        <section style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--borda-suave)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <h2 style={{ fontFamily: "var(--font-tormenta), var(--serifa)", color: "var(--carmesim)", fontSize: 20, margin: 0 }}>Salvar config.json</h2>
            <button onClick={salvarNoArquivo} style={{ cursor: "pointer", fontFamily: "var(--serifa)", fontSize: 13, padding: "5px 14px", borderRadius: 18, border: "none", background: "var(--carmesim)", color: "#fff" }}>Salvar no arquivo</button>
            <button onClick={copiar} style={{ cursor: "pointer", fontFamily: "var(--serifa)", fontSize: 13, padding: "5px 14px", borderRadius: 18, border: "1px solid var(--carmesim)", background: "transparent", color: "var(--carmesim)" }}>Copiar</button>
            <button onClick={baixar} style={{ cursor: "pointer", fontFamily: "var(--serifa)", fontSize: 13, padding: "5px 14px", borderRadius: 18, border: "1px solid var(--borda-suave)", background: "transparent", color: "var(--tinta)" }}>Baixar</button>
            <button onClick={restaurarPadrao} title="Limpa as edições salvas no navegador e volta ao config.json" style={{ cursor: "pointer", fontFamily: "var(--serifa)", fontSize: 13, padding: "5px 14px", borderRadius: 18, border: "1px solid var(--borda-suave)", background: "transparent", color: "var(--tinta-suave)" }}>Restaurar padrão</button>
            {salvo && <span style={{ fontFamily: "var(--serifa)", fontSize: 12, color: "#3a5a40" }}>{salvo}</span>}
          </div>
          <textarea readOnly value={configEditado} style={{ width: "100%", height: 180, fontFamily: "monospace", fontSize: 11, padding: 10, borderRadius: 8, border: "1px solid var(--borda-suave)", background: "rgba(255,250,240,.5)", color: "var(--tinta)" }} />
        </section>
      </div>
    </main>
  );
}
