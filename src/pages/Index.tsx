import HeroSection from "@/components/HeroSection";
import RankingSection from "@/components/RankingSection";
import EventInfoSection from "@/components/EventInfoSection";
import RouteSection from "@/components/RouteSection";
import AthletesSection from "@/components/AthletesSection";
import RegistrationForm from "@/components/RegistrationForm";
import SponsorSection from "@/components/SponsorSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <RankingSection />
      <EventInfoSection />
      <RouteSection />
      <AthletesSection />
      <RegistrationForm />
      <SponsorSection />
      <Footer />
    </main>
  );
};

export default Index;
