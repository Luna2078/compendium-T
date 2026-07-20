import type { Metadata } from "next";
import { carregarDadosGacha, lerConfigGachaRaw } from "@/lib/gacha/pools.server";
import { MestreCliente } from "./MestreCliente";

export const metadata: Metadata = {
  title: "Painel do Mestre — Gacha de Arton",
  description: "Calibra os pesos e a composição do gacha.",
};

export default function PaginaMestre() {
  const dados = carregarDadosGacha();
  const config = lerConfigGachaRaw();
  return <MestreCliente dados={dados} config={config} />;
}
