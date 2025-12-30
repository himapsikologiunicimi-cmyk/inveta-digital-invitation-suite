import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToKatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("katalog");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Undangan pernikahan digital elegan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/50 to-secondary/80" />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 text-center py-20 pt-32">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent font-medium text-sm mb-6 animate-fade-in-down">
            ✨ Undangan Digital Premium #1 di Indonesia
          </span>

          <h1 className="heading-xl text-primary-foreground mb-6 animate-fade-in-up">
            Undangan Pernikahan{" "}
            <span className="text-gradient">Digital</span>{" "}
            Elegan & Praktis
          </h1>

          <p className="body-lg text-primary-foreground/90 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Wujudkan undangan pernikahan impian Anda dengan desain elegan, fitur lengkap, 
            dan harga terjangkau. Disebarkan tanpa batas, dilihat kapan saja.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Button variant="gold" size="xl" onClick={scrollToKatalog}>
              Lihat Katalog
            </Button>
            <Button variant="hero-secondary" size="xl" onClick={scrollToKatalog}>
              Pesan Sekarang
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-primary-foreground/80 animate-fade-in-up delay-400">
            <div className="flex items-center gap-2">
              <span className="text-accent text-xl">★</span>
              <span className="text-sm">Rating 4.9/5</span>
            </div>
            <div className="h-4 w-px bg-primary-foreground/30" />
            <div className="flex items-center gap-2">
              <span className="text-accent text-xl">♥</span>
              <span className="text-sm">10.000+ Pasangan</span>
            </div>
            <div className="h-4 w-px bg-primary-foreground/30" />
            <div className="flex items-center gap-2">
              <span className="text-accent text-xl">✓</span>
              <span className="text-sm">Garansi Revisi</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <ChevronDown className="w-8 h-8 text-primary-foreground/60" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
