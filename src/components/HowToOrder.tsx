import { Palette, FileText, CreditCard, Share2 } from "lucide-react";

const steps = [
  {
    icon: Palette,
    step: "01",
    title: "Pilih Tema",
    description: "Jelajahi koleksi tema premium dan pilih yang sesuai dengan selera Anda",
  },
  {
    icon: FileText,
    step: "02",
    title: "Isi Data",
    description: "Lengkapi data pernikahan, galeri foto, dan informasi acara",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Pembayaran",
    description: "Lakukan pembayaran via transfer bank atau QRIS",
  },
  {
    icon: Share2,
    step: "04",
    title: "Sebar Undangan",
    description: "Undangan aktif dan siap dibagikan ke semua tamu",
  },
];

const HowToOrder = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Cara Pemesanan
          </span>
          <h2 className="heading-lg text-foreground mt-3 mb-4">
            <span className="text-primary">4 Langkah</span> Mudah
          </h2>
          <p className="body-md text-muted-foreground">
            Proses pemesanan yang simpel dan cepat
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="relative group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="relative bg-card p-8 rounded-2xl border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300">
                {/* Step Number */}
                <span className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-lg">
                  {item.step}
                </span>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                  <item.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>

                <h3 className="heading-sm text-foreground mb-3">{item.title}</h3>
                <p className="body-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToOrder;
