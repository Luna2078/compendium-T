import { Fragment } from "react";
import { tokenizar, type Registro } from "@/lib/autolink";
import { Tooltip } from "./Tooltip";
import { LinkEntidade } from "./LinkEntidade";

export function TextoRico({
  texto, registro, descricoes = {},
}: { texto: string; registro: Registro; descricoes?: Record<string, string> }) {
  const tokens = tokenizar(texto, registro);
  return (
    <>
      {tokens.map((tk, i) => {
        if (tk.tipo === "texto") return <Fragment key={i}>{tk.valor}</Fragment>;
        if (tk.tipo === "tooltip")
          return <Tooltip key={i} termoId={tk.termoId} rotulo={tk.valor} descricao={descricoes[tk.termoId]} />;
        return <LinkEntidade key={i} alvoId={tk.alvoId} alvoTipo={tk.alvoTipo} rotulo={tk.valor} />;
      })}
    </>
  );
}
