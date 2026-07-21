// Identidade FIXA do seed — ids/emails/senha dev. Reusado pelo seed (Fase 1) e pelo
// teste RLS (Fase 2), pra os dois falarem do MESMO Thaíde/dono/mestre.
// Projeto PRIVADO + usuários dev → senha no código é aceitável aqui; mover p/ env se publicar.

export const MESA_ID = "11111111-1111-4111-8111-111111111111";
export const CAMPANHA_ID = "22222222-2222-4222-8222-222222222222";
export const THAIDE_ID = "33333333-3333-4333-8333-333333333333";

export const DONO = { email: "thaide-dono@seed.local", password: "seed-thaide-dev-1234" };
export const MESTRE = { email: "mestre@seed.local", password: "seed-mestre-dev-1234" };
// Usuário FORA da mesa — só existe pro teste NEGATIVO da Fase 2 (a RLS tem que negar).
export const ESTRANHO = { email: "estranho@seed.local", password: "seed-estranho-dev-1234" };
