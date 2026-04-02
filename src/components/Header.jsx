import hero from "../assets/hero.png";

export default function Header() {
    return (
        <header className = "header">
            <img src = {hero} alt="Logo da E&Y Turismo" width="100" />
            <h2> E&Y Turismo </h2>
            <nav>
                <a href = "#"> Início </a>
                <a href = "#"> Destinos</a>
                <a href = "#"> Contato</a>
            </nav>
        </header>
    );
}