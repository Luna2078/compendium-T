import { Divisor } from "@/components/Divisor";

export default function Estilo() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 40 }}>
      <h1 className="titulo-grimorio" style={{ fontSize: 44, textAlign: "center" }}>Compêndio de Arton</h1>
      <Divisor />
      <p style={{ fontFamily: "var(--serifa)", lineHeight: 1.7, marginTop: 20, color: "var(--texto-casca)" }}>
        Vitrine do tema "Tomo de Arton": casca escura em tons de vinho e carmesim, títulos na fonte da
        Tormenta com degradê dourado→carmesim, e painéis de pergaminho claro para leitura confortável.
      </p>
    </main>
  );
}
