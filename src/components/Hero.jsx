export default function Hero () {

    function irParaDestinosPage(){
        const secao = document.getElementById("destinopage");
    secao.scrollIntoView({ behavior: "smooth" });

    }
    
    return (
        <section className = "hero">
            <h1> Bem-vindo à E&Y Turismo </h1>
            <p> Viaje com a garantia de voltar com vida... talvez </p>
            <button onClick={irParaDestinosPage}> Ver meu pacote </button>
        </section>
    )
}