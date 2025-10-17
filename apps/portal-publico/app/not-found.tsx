export default function NotFound() {
  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1rem" }}>
        Empreendimento não encontrado
      </h1>
      <p style={{ color: "#555", marginBottom: "2rem" }}>
        O conteúdo que você procura pode ter sido removido ou ainda não foi publicado.
      </p>
      <a href="/" style={{ color: "#0b5dd7", fontWeight: 600 }}>
        Voltar para a página inicial
      </a>
    </main>
  );
}
