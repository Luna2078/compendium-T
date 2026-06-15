import type { Metadata } from "next";
import { carregarDadosGacha } from "@/lib/gacha/pools.server";
import { GachaCliente } from "./GachaCliente";

export const metadata: Metadata = {
  title: "Gacha de Arton — Tormenta 20",
  description: "Protótipo de gacha de itens do compêndio.",
};

export default function PaginaGacha() {
  const dados = carregarDadosGacha();
  return <GachaCliente dados={dados} />;
}
