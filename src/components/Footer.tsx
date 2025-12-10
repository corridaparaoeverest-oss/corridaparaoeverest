import { Mountain, Cog } from "lucide-react";
import { useState } from "react";
import ConfigPanel from "@/components/ConfigPanel";

const Footer = () => {
  const [configOpen, setConfigOpen] = useState(false);
  return (
    <footer className="py-8 bg-forest text-primary-foreground">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mountain className="w-6 h-6 text-sunset" />
            <span className="font-display text-xl">Corrida para o Everest</span>
          </div>
          
          <nav className="flex gap-6 text-sm items-center">
            <a href="#info" className="hover:text-sunset transition-colors">Informações</a>
            <a href="#percurso" className="hover:text-sunset transition-colors">Percurso</a>
            <a href="#inscricao" className="hover:text-sunset transition-colors">Inscrição</a>
            <button
              aria-label="Configurações"
              className="ml-2 inline-flex items-center p-2 rounded-md hover:bg-forest/70 text-primary-foreground/80 hover:text-primary-foreground"
              onClick={() => setConfigOpen(true)}
              title="Configuração"
            >
              <Cog className="w-4 h-4" />
            </button>
          </nav>
          
          <p className="text-sm text-primary-foreground/70">
            26/12/2025 • Miracema - RJ
          </p>
        </div>
      </div>
      <ConfigPanel open={configOpen} onOpenChange={setConfigOpen} />
    </footer>
  );
};

export default Footer;
