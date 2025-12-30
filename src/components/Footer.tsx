import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">
                  I
                </span>
              </div>
              <span className="font-display font-bold text-2xl">Inveta</span>
            </Link>
            <p className="text-secondary-foreground/80 mb-6">
              Platform undangan pernikahan digital premium #1 di Indonesia.
              Elegan, praktis, dan terjangkau.
            </p>
            {/* Social */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-[hsl(142_70%_45%)] hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">
              Menu
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/katalog"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Katalog Tema
                </Link>
              </li>
              <li>
                <a
                  href="/#faq"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/#contact"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Hubungi Admin
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">
              Informasi
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Cara Pemesanan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Tutorial
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Kontak</h4>
            <ul className="space-y-3 text-secondary-foreground/80">
              <li>
                <span className="block text-sm text-secondary-foreground/60">
                  WhatsApp
                </span>
                +62 812-3456-7890
              </li>
              <li>
                <span className="block text-sm text-secondary-foreground/60">
                  Email
                </span>
                hello@inveta.id
              </li>
              <li>
                <span className="block text-sm text-secondary-foreground/60">
                  Jam Operasional
                </span>
                08:00 - 21:00 WIB
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-foreground/60">
            © {new Date().getFullYear()} Inveta. All rights reserved.
          </p>
          <p className="text-sm text-secondary-foreground/60">
            Made with ❤️ for happy couples
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
