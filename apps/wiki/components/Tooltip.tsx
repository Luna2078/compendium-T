"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LARGURA = 240;
const ATRASO_ABRIR = 140;
const ATRASO_FECHAR = 160;

// Garante apenas UM tooltip aberto por vez (evita "rastro"/salto ao varrer várias palavras).
let ativo: { fechar: () => void } | null = null;

export function Tooltip({ rotulo, descricao, termoId }: { rotulo: string; descricao?: string; termoId: string }) {
  const [aberto, setAberto] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const abertoRef = useRef(false);
  const tAbrir = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tFechar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const self = useRef<{ fechar: () => void }>({ fechar: () => {} });

  const cancelarAbrir = () => { if (tAbrir.current) { clearTimeout(tAbrir.current); tAbrir.current = null; } };
  const cancelarFechar = () => { if (tFechar.current) { clearTimeout(tFechar.current); tFechar.current = null; } };

  self.current.fechar = () => {
    cancelarAbrir();
    cancelarFechar();
    abertoRef.current = false;
    setAberto(false);
    if (ativo === self.current) ativo = null;
  };

  function agendarFechar() {
    cancelarFechar();
    tFechar.current = setTimeout(() => self.current.fechar(), ATRASO_FECHAR);
  }

  function abrirAgora(cx: number | null) {
    if (ativo && ativo !== self.current) ativo.fechar(); // fecha o anterior
    ativo = self.current;
    cancelarAbrir();
    cancelarFechar();
    const el = ref.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const x = cx ?? r.left + r.width / 2; // centra no cursor; sem cursor (teclado), no centro do termo
      const left = Math.max(8, Math.min(x - LARGURA / 2, vw - LARGURA - 8));
      setPos({ left, top: r.top - 2 });
    }
    abertoRef.current = true;
    setAberto(true);
  }

  // intenção de hover: só abre se o mouse ficar parado sobre o termo
  function aoEntrar(e: React.MouseEvent) {
    cancelarFechar();
    if (abertoRef.current) return; // já aberto: não reposiciona
    const cx = e.clientX;
    cancelarAbrir();
    tAbrir.current = setTimeout(() => abrirAgora(cx), ATRASO_ABRIR);
  }
  function aoSair() {
    cancelarAbrir();
    agendarFechar();
  }

  useEffect(() => () => { cancelarAbrir(); cancelarFechar(); }, []);

  return (
    <span
      ref={ref}
      data-tooltip={termoId}
      tabIndex={0}
      onMouseEnter={aoEntrar}
      onMouseLeave={aoSair}
      onFocus={() => abrirAgora(null)}
      onBlur={agendarFechar}
      style={{ borderBottom: "2px dotted var(--tooltip-linha)", color: "var(--tooltip)", fontWeight: 700, cursor: "help" }}
    >
      {rotulo}
      <AnimatePresence>
        {aberto && descricao && pos && (
          <motion.span
            role="tooltip"
            onMouseEnter={cancelarFechar}
            onMouseLeave={agendarFechar}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              transform: "translateY(-100%)",
              width: LARGURA,
              background: "linear-gradient(180deg,#fbf3df,#f1e3c4)",
              color: "var(--tinta)",
              border: "1px solid var(--borda)",
              borderRadius: 10,
              padding: "11px 13px",
              font: "400 12px/1.5 var(--serifa)",
              boxShadow: "0 14px 40px rgba(0,0,0,.55)",
              zIndex: 100,
            }}
          >
            <b style={{ color: "var(--carmesim)" }}>{rotulo}</b>
            <br />
            {descricao}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
