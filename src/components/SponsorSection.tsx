import logoRancho from "@/assets/logo-rancho-confraria.png";

const SponsorSection = () => {
  return (
    <section className="py-16 bg-muted/50 border-t border-border">
      <div className="container">
        <div className="text-center">
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">
            Patrocínio
          </p>
          <div className="flex justify-center items-center">
            <img 
              src={logoRancho} 
              alt="Rancho Confraria - Patrocinador" 
              className="h-24 md:h-32 w-auto object-contain"
            />
          </div>
          <p className="text-muted-foreground text-sm mt-6">
            Rancho Confraria
          </p>
        </div>
      </div>
    </section>
  );
};

export default SponsorSection;
