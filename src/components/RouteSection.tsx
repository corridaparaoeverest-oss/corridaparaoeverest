import { MapPin, Flag, Mountain } from "lucide-react";

const RouteSection = () => {
  // Endereços encodados para Google Maps
  const enderecoLargada = encodeURIComponent("Parque de Exposições - Miracema RJ");
  const enderecoChegada = encodeURIComponent("x Flores - Estr. Miracema, km 10 - Rural, Miracema - RJ, 28460-000");
  
  return (
    <section id="percurso" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Percurso da <span className="text-primary">Corrida</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            10 km de paisagens incríveis pelo interior de Miracema
          </p>
        </div>
        
        {/* Route Map */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border">
            <iframe
              src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${enderecoLargada}&destination=${enderecoChegada}&mode=walking`}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Percurso marcado no mapa"
              className="w-full"
            />
          </div>
          
          {/* Route Points */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-3 bg-card rounded-full px-6 py-3 shadow-md border border-border">
              <div className="p-2 rounded-full bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Largada</p>
                <p className="font-display text-foreground">Parque de Exposições</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center">
              <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-secondary" />
              <Mountain className="w-8 h-8 text-secondary mx-2" />
              <div className="w-20 h-0.5 bg-gradient-to-r from-secondary to-primary" />
            </div>
            
            <div className="flex items-center gap-3 bg-card rounded-full px-6 py-3 shadow-md border border-border">
              <div className="p-2 rounded-full bg-secondary/10">
                <Flag className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Chegada</p>
                <p className="font-display text-foreground">Sítio Everest</p>
              </div>
            </div>
          </div>
          
          {/* Address details */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Endereço da chegada:</strong> x Flores - Estr. Miracema, km 10 - Rural, Miracema - RJ
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RouteSection;
