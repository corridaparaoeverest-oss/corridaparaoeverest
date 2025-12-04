import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Timer } from "lucide-react";
import fundoEverest from "@/assets/fundo-everest.png";

const HeroSection = () => {
  const scrollToRegistration = () => {
    document.getElementById("inscricao")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${fundoEverest})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 container text-center text-primary-foreground px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg md:text-xl font-body mb-4 opacity-0 animate-fade-up tracking-wide uppercase">
            Miracema - RJ
          </p>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display mb-6 opacity-0 animate-fade-up animation-delay-100 leading-tight">
            Corrida para o
            <span className="block text-sunset">Everest</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-body mb-8 opacity-0 animate-fade-up animation-delay-200 font-light">
            10 km de pura aventura pelo interior fluminense
          </p>
          
          {/* Quick Info */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10 opacity-0 animate-fade-up animation-delay-300">
            <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Calendar className="w-5 h-5 text-sunset" />
              <span className="text-sm md:text-base">26/12/2025 • 07:00h</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <MapPin className="w-5 h-5 text-sunset" />
<<<<<<< HEAD
              <span className="text-sm md:text-base">Parque de Exposições</span>
=======
              <span className="text-sm md:text-base">Praça Dona Ermelinda</span>
>>>>>>> 09470fbd4707399b0e62a81a255f5899c44693f4
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Timer className="w-5 h-5 text-sunset" />
              <span className="text-sm md:text-base">10 KM</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up animation-delay-400">
            <Button variant="hero" size="xl" onClick={scrollToRegistration}>
              Fazer Inscrição
            </Button>
            <Button 
              variant="heroOutline" 
              size="xl"
              onClick={() => document.getElementById("percurso")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver Percurso
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in animation-delay-400">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-primary-foreground/70 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
