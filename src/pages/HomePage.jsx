import Header from "../components/Header";
import Hero from "../components/Hero";
import DestinosPage from "../pages/DestinosPage";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

export default function HomePage() {
    return (
        <>
        <Header />
        <Hero />
        <DestinosPage />
        <Footer />
        <WhatsAppButton />
        {/* GIF RollerCoaster - fundo da Home */}
<div  style={{
    position: "fixed",
    inset: 0,
    zIndex: -1,
  }}
>
  <img
    src="/rollercoaster.gif"
    alt=""
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: 0.2,
    }}
  />
</div>
        </>
    );
}
