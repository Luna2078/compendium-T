"use server";
// Auth por e-mail/senha. Usa o cliente-servidor (cookie) — nunca service_role. A senha vai
// pro Supabase Auth, que guarda o hash no servidor (não fazemos hand-roll, não guardamos claro).
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { EstadoAuth } from "./tipos";

export async function entrar(_prev: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  const sb = await criarClienteServidor();
  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: `Não entrou: ${error.message}` }; // FALHA ALTA — diz por quê
  revalidatePath("/", "layout");
  redirect("/");
}

export async function cadastrar(_prev: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  // Sem validação de força (login separa jogadores, não é cofre) — mas o Auth hasheia a senha.
  // O projeto está com "Confirm email" DESLIGADO → signUp já devolve sessão e a conta entra
  // direto. O guard abaixo é rede de segurança (falha alta): se um dia a confirmação voltar a
  // ligar, o cadastro não some em silêncio — diz por quê em vez de fingir que entrou.
  const sb = await criarClienteServidor();
  const { data, error } = await sb.auth.signUp({ email, password: senha });
  if (error) return { erro: `Não cadastrou: ${error.message}` };
  if (!data.session)
    return { erro: "Conta criada, mas sem sessão — 'Confirm email' voltou a ficar LIGADO? Desligue em Auth → Sign In / Providers → Email." };
  revalidatePath("/", "layout");
  redirect("/");
}

export async function sair(): Promise<void> {
  const sb = await criarClienteServidor();
  await sb.auth.signOut();
  redirect("/login");
}
