export default function WhatsAppButton() {
  const numero = "5541988710516";
  const mensagem = "Olá, quero saber mais sobre seu pacote!";

  const link = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
      💬
    </a>
  );
}