import { Heart, Target, Eye } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Tentang Kami
            </span>
            <h2 className="heading-lg text-foreground mt-3 mb-6">
              Kenapa Memilih{" "}
              <span className="text-primary">Inveta?</span>
            </h2>
            <p className="body-md text-muted-foreground mb-6">
              Inveta adalah platform undangan pernikahan digital terkemuka di
              Indonesia. Kami berkomitmen untuk membantu pasangan mewujudkan
              undangan pernikahan yang elegan, praktis, dan berkesan.
            </p>
            <p className="body-md text-muted-foreground mb-8">
              Dengan lebih dari 5 tahun pengalaman dan 10.000+ pasangan bahagia
              yang telah kami layani, Inveta menjadi pilihan terpercaya untuk
              undangan digital premium.
            </p>

            {/* Values */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-1">
                    Dibuat dengan Cinta
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Setiap undangan dirancang dengan detail dan perhatian penuh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-1">
                    Fokus pada Kualitas
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Desain premium dengan performa optimal di semua perangkat
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-1">
                    Transparan & Terpercaya
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Harga jelas tanpa biaya tersembunyi, garansi kepuasan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Stats Card */}
          <div className="relative">
            <div className="bg-hero-gradient rounded-3xl p-8 md:p-12 text-primary-foreground">
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-8">
                Misi Kami
              </h3>
              <p className="text-lg text-primary-foreground/90 mb-8">
                "Mempermudah setiap pasangan untuk berbagi kebahagiaan melalui
                undangan pernikahan digital yang indah, fungsional, dan mudah
                diakses oleh semua tamu."
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-primary-foreground/10 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                    5+
                  </div>
                  <div className="text-sm text-primary-foreground/80">
                    Tahun Berpengalaman
                  </div>
                </div>
                <div className="text-center p-4 bg-primary-foreground/10 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                    50+
                  </div>
                  <div className="text-sm text-primary-foreground/80">
                    Pilihan Tema
                  </div>
                </div>
                <div className="text-center p-4 bg-primary-foreground/10 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                    24/7
                  </div>
                  <div className="text-sm text-primary-foreground/80">
                    Support Online
                  </div>
                </div>
                <div className="text-center p-4 bg-primary-foreground/10 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                    100%
                  </div>
                  <div className="text-sm text-primary-foreground/80">
                    Garansi Kepuasan
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
