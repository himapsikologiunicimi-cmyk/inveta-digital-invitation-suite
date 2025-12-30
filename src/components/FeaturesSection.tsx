import {
  Users,
  Send,
  ClipboardCheck,
  Timer,
  MapPin,
  Wallet,
  Video,
  RefreshCw,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Custom Nama Tamu",
    description: "Setiap tamu mendapat undangan personal dengan nama mereka",
  },
  {
    icon: Send,
    title: "Unlimited Sebar",
    description: "Kirim undangan ke ribuan tamu tanpa batas",
  },
  {
    icon: ClipboardCheck,
    title: "RSVP & Buku Tamu",
    description: "Konfirmasi kehadiran dan ucapan langsung tercatat",
  },
  {
    icon: Timer,
    title: "Countdown Timer",
    description: "Hitung mundur menuju hari bahagia Anda",
  },
  {
    icon: MapPin,
    title: "Google Maps",
    description: "Lokasi acara terintegrasi dengan navigasi",
  },
  {
    icon: Wallet,
    title: "Amplop Digital",
    description: "Terima hadiah via transfer bank & QRIS",
  },
  {
    icon: Video,
    title: "Live Streaming",
    description: "Bagikan momen spesial secara online",
  },
  {
    icon: RefreshCw,
    title: "Revisi Mudah",
    description: "Ubah detail undangan kapan saja",
  },
];

const FeaturesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Fitur Unggulan
          </span>
          <h2 className="heading-lg text-foreground mt-3 mb-4">
            Semua yang Anda Butuhkan dalam{" "}
            <span className="text-primary">Satu Undangan</span>
          </h2>
          <p className="body-md text-muted-foreground">
            Fitur lengkap untuk membuat undangan pernikahan digital yang sempurna
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="heading-sm text-foreground mb-2">{feature.title}</h3>
              <p className="body-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
