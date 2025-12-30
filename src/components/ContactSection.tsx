import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, Phone, Mail } from "lucide-react";

const ContactSection = () => {
  const whatsappNumber = "6281234567890";
  const whatsappMessage = encodeURIComponent(
    "Hallo Admin Inveta, saya ingin bertanya tentang undangan digital."
  );

  return (
    <section id="contact" className="section-padding bg-background">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Card */}
          <div className="relative bg-card rounded-3xl border border-border overflow-hidden shadow-elevated">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full -translate-x-1/2 translate-y-1/2" />

            <div className="relative p-8 md:p-12 text-center">
              <span className="text-primary font-medium text-sm uppercase tracking-wider">
                Hubungi Kami
              </span>
              <h2 className="heading-lg text-foreground mt-3 mb-4">
                Butuh <span className="text-primary">Bantuan?</span>
              </h2>
              <p className="body-md text-muted-foreground mb-8 max-w-xl mx-auto">
                Tim kami siap membantu Anda dengan pertanyaan seputar undangan
                digital. Jangan ragu untuk menghubungi kami!
              </p>

              {/* Contact Info */}
              <div className="grid sm:grid-cols-3 gap-6 mb-10">
                <div className="flex flex-col items-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Jam Operasional</h4>
                  <p className="text-sm text-muted-foreground">08:00 - 21:00 WIB</p>
                </div>

                <div className="flex flex-col items-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">WhatsApp</h4>
                  <p className="text-sm text-muted-foreground">+62 812-3456-7890</p>
                </div>

                <div className="flex flex-col items-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Email</h4>
                  <p className="text-sm text-muted-foreground">hello@inveta.id</p>
                </div>
              </div>

              {/* WhatsApp Button */}
              <Button
                variant="whatsapp"
                size="xl"
                className="gap-3"
                asChild
              >
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-6 h-6" />
                  Chat via WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
