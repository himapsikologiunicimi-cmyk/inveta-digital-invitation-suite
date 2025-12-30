import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import theme1 from "@/assets/theme-1.jpg";
import theme2 from "@/assets/theme-2.jpg";
import theme3 from "@/assets/theme-3.jpg";
import theme4 from "@/assets/theme-4.jpg";

const themes = [
  {
    id: 1,
    name: "Romantic Blush",
    image: theme1,
    originalPrice: 250000,
    price: 149000,
  },
  {
    id: 2,
    name: "Royal Navy",
    image: theme2,
    originalPrice: 300000,
    price: 199000,
  },
  {
    id: 3,
    name: "Rustic Garden",
    image: theme3,
    originalPrice: 250000,
    price: 149000,
  },
  {
    id: 4,
    name: "Art Deco Gold",
    image: theme4,
    originalPrice: 350000,
    price: 249000,
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const ThemesPreview = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Pilihan Tema
          </span>
          <h2 className="heading-lg text-foreground mt-3 mb-4">
            Tema <span className="text-primary">Unggulan</span> Kami
          </h2>
          <p className="body-md text-muted-foreground">
            Pilih dari koleksi tema premium yang dirancang dengan elegan
          </p>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {themes.map((theme, index) => (
            <div
              key={theme.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 shadow-soft hover:shadow-elevated transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={theme.image}
                  alt={theme.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Hover Actions */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <Button variant="hero-secondary" size="sm" className="w-full" asChild>
                    <Link to={`/order/${theme.id}`}>Lihat Contoh</Link>
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {theme.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through text-sm">
                    {formatPrice(theme.originalPrice)}
                  </span>
                  <span className="text-primary font-bold text-lg">
                    {formatPrice(theme.price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="hero" size="lg" asChild>
            <Link to="/katalog" className="flex items-center gap-2">
              Lihat Semua Tema
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ThemesPreview;
