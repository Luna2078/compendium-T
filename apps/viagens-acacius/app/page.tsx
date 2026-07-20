// ── ETAPA 1 — o esqueleto ligado ────────────────────────────────────────────────
// Objetivo único: provar que o app importa o motor e renderiza um NÚMERO CALCULADO.
// Feio de propósito: zero estilo, texto cru. Se "PV: 58" aparece, a etapa cumpriu.
//
// ── DECISÃO DE ARQUITETURA: o cálculo roda no SERVIDOR ───────────────────────────
// Isto é um SERVER COMPONENT (o padrão do App Router — sem "use client"). Ele roda em
// Node, nunca no navegador. A razão é dura, não estética:
//
//   `calcularFicha` recebe o compêndio, e `carregarEntidades()` LÊ 3.242 JSONs do DISCO
//   (`node:fs`). Disco só existe no servidor. Empacotar os JSONs para o cliente seria
//   megabytes no bundle e ainda assim o carregador usa fs — não roda no navegador.
//
// Então: o servidor carrega os dados, calcula a ficha, e manda para o cliente o RESULTADO
// já pronto (HTML). O motor não vai para o bundle do navegador; os dados ficam perto do
// cálculo. É o caminho (a) que o enunciado da etapa apontou como provável certo — e é.
//
// Nota para a Etapa 3 (toggle da Fúria ao vivo): como o motor é PURO (recebe os dados como
// argumento — `calcularFicha(personagem, sessao, compendio, condicoes)`), o recálculo tem
// dois caminhos limpos quando chegar a hora: (a) uma SERVER ACTION que recebe o novo estado
// de sessão e reroda calcularFicha no servidor; ou (b) enviar ao cliente só as entidades
// que ESTE personagem usa + o motor, para recompor localmente. Nenhum dos dois é construído
// agora — mas por não ter travado em `output: "export"`, os dois continuam possíveis.

import { readFileSync } from "node:fs";
import {
  carregarEntidades,
  caminhoDados,
  PersonagemSchema,
  EstadoDeSessaoSchema,
} from "@ct/compendio";
import { calcularFicha, type CondicaoDef } from "@ct/motor";

function lerFicha() {
  const compendio = carregarEntidades();
  const personagem = PersonagemSchema.parse(
    JSON.parse(readFileSync(caminhoDados("personagens", "thaide.json"), "utf8")),
  );
  const sessao = EstadoDeSessaoSchema.parse(
    JSON.parse(readFileSync(caminhoDados("personagens", "thaide.sessao.json"), "utf8")),
  );
  const condicoes = JSON.parse(
    readFileSync(caminhoDados("referencia", "condicoes.json"), "utf8"),
  ) as CondicaoDef[];
  return calcularFicha(personagem, sessao, compendio, condicoes);
}

export default function Pagina() {
  const f = lerFicha();

  return (
    <main>
      <h1>Viagens Acácius — Etapa 1 (esqueleto)</h1>

      <p>
        {f.nome} — nível {f.nivel} ({f.classes.map((c) => `${c.classeId} ${c.niveis}`).join(" / ")})
      </p>

      <h2>Atributos</h2>
      <ul>
        {(["for", "des", "con", "int", "sab", "car"] as const).map((a) => (
          <li key={a}>
            {a.toUpperCase()}: {f.atributos[a]}
          </li>
        ))}
      </ul>

      <h2>Derivados</h2>
      <ul>
        <li>PV: {f.pv.max}{f.pv.temporario ? ` (+${f.pv.temporario} temporário)` : ""}</li>
        <li>PM: {f.pm.max}</li>
        <li>Defesa: {f.defesa}</li>
        <li>Deslocamento: {f.deslocamentos.base}m</li>
      </ul>

      <h2>Perícias</h2>
      <ul>
        {Object.entries(f.pericias)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([id, v]) => (
            <li key={id}>
              {id}: {v.valor}
              {v.treinado ? " (treinado)" : ""}
              {!v.usavel ? " [exige treino]" : ""}
            </li>
          ))}
      </ul>
    </main>
  );
}
