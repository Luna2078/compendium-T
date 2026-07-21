"use client";
// /login — e-mail/senha, com toggle entrar/criar conta. Lo-fi (como o Bloco 1). O motor e a
// ficha não sabem que isto existe; só o Auth + o server-client falam com a sessão.
import { useActionState, useState } from "react";
import { entrar, cadastrar } from "./acoes";
import type { EstadoAuth } from "./tipos";

const inicial: EstadoAuth = { erro: null };

export default function Login() {
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [estado, acao, pendente] = useActionState(
    modo === "entrar" ? entrar : cadastrar,
    inicial,
  );

  return (
    <div className="login-wrap">
      <form action={acao} className="login">
        <h1 className="login__tit">{modo === "entrar" ? "Entrar" : "Criar conta"}</h1>

        <label className="login__campo">
          <span>E-mail</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="login__campo">
          <span>Senha</span>
          <input name="senha" type="password" autoComplete="current-password" required minLength={1} />
        </label>

        {estado.erro && <p className="login__erro" role="alert">{estado.erro}</p>}

        <button type="submit" className="login__enviar" disabled={pendente}>
          {pendente ? "..." : modo === "entrar" ? "Entrar" : "Criar conta"}
        </button>

        <button
          type="button"
          className="login__toggle"
          onClick={() => setModo((m) => (m === "entrar" ? "cadastrar" : "entrar"))}
        >
          {modo === "entrar" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
        </button>
      </form>
    </div>
  );
}
