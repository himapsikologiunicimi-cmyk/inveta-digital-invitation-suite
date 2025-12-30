import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import CatalogSection from "@/components/CatalogSection";
import HowToOrder from "@/components/HowToOrder";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import PaymentMethods from "@/components/PaymentMethods";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Inveta - Undangan Pernikahan Digital Elegan & Premium</title>
        <meta
          name="description"
          content="Inveta adalah platform undangan pernikahan digital premium di Indonesia. Desain elegan, fitur lengkap, harga terjangkau. Lebih dari 10.000+ pasangan bahagia."
        />
        <meta
          name="keywords"
          content="undangan pernikahan digital, undangan online, undangan nikah, wedding invitation, undangan digital murah, undangan elegan"
        />
        <link rel="canonical" href="https://inveta.id" />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />
        <main>
          <HeroSection />
          <StatsSection />
          <FeaturesSection />
          <CatalogSection />
          <HowToOrder />
          <FAQSection />
          <ContactSection />
          <PaymentMethods />
          <AboutSection />
        </main>
        <Footer />
        <WhatsAppFloat />
      </div>
    </>
  );
};

export default Index;
