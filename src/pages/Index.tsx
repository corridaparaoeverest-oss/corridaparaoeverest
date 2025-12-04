import HeroSection from "@/components/HeroSection";
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
