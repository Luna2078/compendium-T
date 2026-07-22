// ⚠️ PROVISÓRIO E ISOLADO — o slot vazio (vaga aberta) preenchível. Feito SÓ com primitivas e
// tokens do Design System; um desenho próprio do slot está sendo feito em paralelo. Trocar barato
// quando chegar: toda a cara vive aqui + na classe .vaga do globals.css. Nenhuma cara nova inventada.
//
// Elegibilidade HONESTA (pino 3): oferece o que a vaga DECLARA. Se { modo: "nao-declarada" }
// (o "exceto Carisma" em prosa), NÃO inventa lista — entrada livre + aviso de que a regra não é
// legível por máquina. Nunca lista falsa.
import type { Vaga } from "@ct/motor";

const ATRIBUTOS: Array<{ cod: string; nome: string }> = [
  { cod: "for", nome: "Força" }, { cod: "des", nome: "Destreza" }, { cod: "con", nome: "Constituição" },
  { cod: "int", nome: "Inteligência" }, { cod: "sab", nome: "Sabedoria" }, { cod: "car", nome: "Carisma" },
];

/** Opções concretas da vaga, conforme ela DECLARA. null = entrada livre (não-declarada / inteiro). */
function opcoesDaVaga(v: Vaga): Array<{ valor: string; rotulo: string }> | null {
  const el = v.elegiveis;
  if (el.modo === "lista") return el.itens.map((i) => ({ valor: i, rotulo: i }));
  if (el.modo === "opcoes")
    return el.opcoes.map((o) => {
      const obj = o as Record<string, unknown>;
      const rotulo = String(obj.rotulo ?? obj.tipo ?? JSON.stringify(o));
      return { valor: rotulo, rotulo };
    });
  if (el.modo === "criterio") {
    if (el.consulta?.alvoTipo === "atributo") return ATRIBUTOS.map((a) => ({ valor: a.cod, rotulo: a.nome }));
    return null; // outros critérios (inteiro puro etc.) → entrada livre
  }
  return null; // nao-declarada
}

export function VagaSlot({ vaga, onFill, ocupado }: { vaga: Vaga; onFill: (alvo: string) => void; ocupado?: boolean }) {
  const opcoes = opcoesDaVaga(vaga);
  const naoDeclarada = vaga.elegiveis.modo === "nao-declarada";
  return (
    <div className="vaga" aria-busy={ocupado}>
      <div className="vaga__topo">
        <span className="vaga__rot">vaga aberta</span>
        <span className="vaga__oque">
          {vaga.oQueFalta}
          {vaga.nivel ? <span className="vaga__nivel"> · nível {vaga.nivel}</span> : null}
          {vaga.quantidade > 1 ? <span className="vaga__nivel"> · faltam {vaga.quantidade}</span> : null}
        </span>
      </div>
      {opcoes ? (
        <select
          className="vaga__sel"
          defaultValue=""
          disabled={ocupado}
          onChange={(e) => { if (e.target.value) onFill(e.target.value); e.currentTarget.value = ""; }}
          aria-label={vaga.oQueFalta}
        >
          <option value="" disabled>escolher…</option>
          {opcoes.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
        </select>
      ) : (
        <input
          className="vaga__livre"
          placeholder="digite o valor"
          disabled={ocupado}
          onKeyDown={(e) => { if (e.key === "Enter" && e.currentTarget.value) { onFill(e.currentTarget.value); e.currentTarget.value = ""; } }}
          aria-label={vaga.oQueFalta}
        />
      )}
      {naoDeclarada && (
        <span className="vaga__aviso">
          ⚠ elegibilidade não legível por máquina — {vaga.elegiveis.modo === "nao-declarada" ? vaga.elegiveis.motivo : ""}. Entrada livre.
        </span>
      )}
    </div>
  );
}
