import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Search, Eye } from "lucide-react";

import theme1 from "@/assets/theme-1.jpg";
import theme2 from "@/assets/theme-2.jpg";
import theme3 from "@/assets/theme-3.jpg";
import theme4 from "@/assets/theme-4.jpg";
import theme5 from "@/assets/theme-5.jpg";
import theme6 from "@/assets/theme-6.jpg";

export interface Theme {
  id: number;
  name: string;
  category: string;
  image: string;
  originalPrice: number;
  price: number;
  features: string[];
}

export const themes: Theme[] = [
  {
    id: 1,
    name: "Romantic Blush",
    category: "Minimalis",
    image: theme1,
    originalPrice: 250000,
    price: 149000,
    features: ["Custom nama tamu", "RSVP", "Countdown", "Google Maps", "Amplop Digital"],
  },
  {
    id: 2,
    name: "Royal Navy",
    category: "Premium",
    image: theme2,
    originalPrice: 300000,
    price: 199000,
    features: ["Custom nama tamu", "RSVP", "Countdown", "Google Maps", "Amplop Digital", "Live Streaming"],
  },
  {
    id: 3,
    name: "Rustic Garden",
    category: "Rustic",
    image: theme3,
    originalPrice: 250000,
    price: 149000,
    features: ["Custom nama tamu", "RSVP", "Countdown", "Google Maps", "Amplop Digital"],
  },
  {
    id: 4,
    name: "Art Deco Gold",
    category: "Premium",
    image: theme4,
    originalPrice: 350000,
    price: 249000,
    features: ["Custom nama tamu", "RSVP", "Countdown", "Google Maps", "Amplop Digital", "Live Streaming", "Custom Domain"],
  },
  {
    id: 5,
    name: "Tropical Paradise",
    category: "Tropis",
    image: theme5,
    originalPrice: 250000,
    price: 149000,
    features: ["Custom nama tamu", "RSVP", "Countdown", "Google Maps", "Amplop Digital"],
  },
  {
    id: 6,
    name: "Classic Burgundy",
    category: "Klasik",
    image: theme6,
    originalPrice: 280000,
    price: 179000,
    features: ["Custom nama tamu", "RSVP", "Countdown", "Google Maps", "Amplop Digital", "Buku Tamu"],
  },
];

export const categories = ["Minimalis", "Premium", "Rustic", "Tropis", "Klasik"];

// Get count of themes per category
export const getCategoryCount = (category: string) => {
  return themes.filter((theme) => theme.category === category).length;
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

interface CatalogSectionProps {
  showHeader?: boolean;
}

const CatalogSection = ({ showHeader = true }: CatalogSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const filteredThemes = themes.filter((theme) => {
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = theme.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="katalog" className="section-padding bg-background scroll-mt-24">
      <div className="container-custom">
        {showHeader && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Katalog Tema
            </span>
            <h2 className="heading-lg text-foreground mt-3 mb-4">
              Pilih <span className="text-primary">Tema Impian</span> Anda
            </h2>
            <p className="body-md text-muted-foreground">
              Koleksi tema undangan digital premium dengan berbagai gaya dan fitur lengkap
            </p>
          </div>
        )}

        {/* Search & Filter */}
        <div className="max-w-2xl mx-auto space-y-6 mb-12">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari tema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-border"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:border-primary/30"
                }`}
              >
                {category} ({getCategoryCount(category)})
              </button>
            ))}
          </div>
        </div>

        {/* Themes Grid */}
        {filteredThemes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Tidak ada tema yang ditemukan
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredThemes.map((theme, index) => (
              <div
                key={theme.id}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 shadow-soft hover:shadow-elevated transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={theme.image}
                    alt={`Tema undangan digital ${theme.name}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
                      {theme.category}
                    </span>
                  </div>

                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                    {theme.name}
                  </h3>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {theme.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                    {theme.features.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded text-primary">
                        +{theme.features.length - 3} lainnya
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-muted-foreground line-through text-sm block">
                        {formatPrice(theme.originalPrice)}
                      </span>
                      <span className="text-primary font-bold text-xl">
                        {formatPrice(theme.price)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Eye className="w-4 h-4" />
                      Lihat Contoh
                    </Button>
                    <Button variant="hero" size="sm" className="flex-1" asChild>
                      <Link to={`/order/${theme.id}`}>Pesan Tema</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CatalogSection;
