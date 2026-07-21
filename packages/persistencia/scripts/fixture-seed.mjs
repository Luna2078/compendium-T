// Identidade FIXA do seed — ids/emails/senha dev. Reusado pelo seed (Fase 1) e pelo
// teste RLS (Fase 2), pra os dois falarem do MESMO Thaíde/dono/mestre.
// Projeto PRIVADO + usuários dev → senha no código é aceitável aqui; mover p/ env se publicar.

export const MESA_ID = "11111111-1111-4111-8111-111111111111";
export const CAMPANHA_ID = "22222222-2222-4222-8222-222222222222";
export const THAIDE_ID = "33333333-3333-4333-8333-333333333333";

// ── Mesa 2 (caso DENSO): o Vharo-20 real, mesmo dono (admin). Prova a espinha
//    mesa→campanha→personagem com N>1 e dá o personagem denso da ficha vestida.
//    NÃO usado pelos testes de RLS (esses só falam da mesa 1) — adição segura.
export const MESA2_ID = "44444444-4444-4444-8444-444444444444";
export const CAMPANHA2_ID = "55555555-5555-4555-8555-555555555555";
export const VHARO_ID = "66666666-6666-4666-8666-666666666666";

// DONO = conta fixa de trabalho do Arthur (dona canônica do Thaíde). É o MESMO uid provado
// nos testes de RLS — só a credencial de login mudou (re-credencial, não migração de uid).
// Senha fraca é intencional: login aqui separa jogadores, não é cofre.
export const DONO = { email: "admin@admin.com", password: "admin123" };
export const MESTRE = { email: "mestre@seed.local", password: "seed-mestre-dev-1234" };
// Usuário FORA da mesa — só existe pro teste NEGATIVO da Fase 2 (a RLS tem que negar).
export const ESTRANHO = { email: "estranho@seed.local", password: "seed-estranho-dev-1234" };
