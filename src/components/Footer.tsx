import { Mountain } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 bg-forest text-primary-foreground">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mountain className="w-6 h-6 text-sunset" />
            <span className="font-display text-xl">Corrida para o Everest</span>
          </div>
          
          <nav className="flex gap-6 text-sm">
            <a href="#info" className="hover:text-sunset transition-colors">Informações</a>
            <a href="#percurso" className="hover:text-sunset transition-colors">Percurso</a>
            <a href="#inscricao" className="hover:text-sunset transition-colors">Inscrição</a>
          </nav>
          
          <p className="text-sm text-primary-foreground/70">
            26/12/2025 • Miracema - RJ
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
