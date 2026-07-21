"use client";
// Prova do pino 2 (arquitetura de tema = troca-de-token). Alterna [data-tema] na RAIZ entre
// o clássico (sem atributo) e o "debug" (conjunto dummy de tokens). A ficha inteira re-veste
// sozinha — nenhum componente é tocado; só muda qual conjunto de var(--*) está ligado.
import { useState } from "react";

export function TemaToggle() {
  const [debug, setDebug] = useState(false);
  const alternar = () => {
    const novo = !debug;
    setDebug(novo);
    if (novo) document.documentElement.setAttribute("data-tema", "debug");
    else document.documentElement.removeAttribute("data-tema");
  };
  return (
    <button type="button" className="tema-toggle" onClick={alternar} title="alterna clássico ↔ debug (prova da troca-de-token)">
      tema: {debug ? "debug" : "clássico"}
    </button>
  );
}
