import { MapPin, Flag, Coffee, Route, Clock, Users } from "lucide-react";

const infoCards = [
  {
    icon: MapPin,
    title: "Largada",
    description: "Parque de Exposições",
    subtitle: "Miracema - RJ",
  },
  {
    icon: Flag,
    title: "Chegada",
    description: "Sítio Everest",
    subtitle: "Miracema - RJ",
  },
  {
    icon: Route,
    title: "Distância",
    description: "10 km",
    subtitle: "Percurso rural",
  },
  {
    icon: Clock,
    title: "Data e Horário",
    description: "26/12/2025 às 07:00h",
    subtitle: "Concentração às 06:30h",
  },
  {
    icon: Coffee,
    title: "Café da Manhã",
    description: "Incluso na chegada",
    subtitle: "No Sítio Everest",
  },
  {
    icon: Users,
    title: "Categorias",
    description: "Geral",
    subtitle: "Masculino e Feminino",
  },
];

const EventInfoSection = () => {
  return (
    <section id="info" className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Informações do <span className="text-primary">Evento</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tudo que você precisa saber sobre a Corrida para o Everest
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {infoCards.map((card, index) => (
            <div 
              key={card.title}
              className="card-glass rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <card.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                    {card.title}
                  </p>
                  <h3 className="text-xl font-display text-foreground mt-1">
                    {card.description}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventInfoSection;
