// Tipo compartilhado entre a server action (acoes.ts) e a tela (page.tsx). Fica fora do
// arquivo "use server" porque este só pode EXPORTAR funções async.
export interface EstadoAuth {
  erro: string | null;
}
