import { Busca } from "@/components/Busca";
import { Divisor } from "@/components/Divisor";

export default function Home() {
  return (
    <main className="folha-main">
      <div className="folha">
        <h1 className="titulo-grimorio" style={{ fontSize: 56, textAlign: "center", marginTop: 24 }}>Compêndio de Arton</h1>
        <Divisor />
        <div style={{ marginTop: 28 }}>
          <Busca />
        </div>
      </div>
    </main>
  );
}
