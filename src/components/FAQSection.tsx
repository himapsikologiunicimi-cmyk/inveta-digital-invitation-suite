import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Berapa lama masa aktif undangan digital?",
    answer:
      "Masa aktif undangan standar adalah 1 tahun sejak tanggal aktivasi. Anda bisa memperpanjang masa aktif dengan paket tambahan jika diperlukan.",
  },
  {
    question: "Apakah bisa melakukan revisi setelah undangan aktif?",
    answer:
      "Tentu! Kami memberikan unlimited revisi untuk perubahan data seperti nama, tanggal, lokasi, dan foto. Revisi dapat dilakukan kapan saja selama masa aktif undangan.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima pembayaran via transfer bank (BCA, Mandiri, BNI, BRI), QRIS, dan e-wallet populer seperti GoPay, OVO, dan DANA.",
  },
  {
    question: "Apakah bisa menggunakan custom domain?",
    answer:
      "Ya, tersedia add-on custom domain untuk menggunakan domain pribadi Anda. Contoh: undangan.namaanda.com. Biaya tambahan untuk custom domain adalah Rp 150.000.",
  },
  {
    question: "Bagaimana jika mengalami kendala teknis?",
    answer:
      "Tim support kami siap membantu setiap hari dari pukul 08:00 - 21:00 WIB via WhatsApp. Kami juga menyediakan video tutorial untuk panduan penggunaan.",
  },
  {
    question: "Berapa lama proses pembuatan undangan?",
    answer:
      "Setelah data lengkap dan pembayaran terkonfirmasi, undangan akan aktif dalam 1x24 jam. Untuk request khusus atau desain custom, estimasi 2-3 hari kerja.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding bg-muted/50">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div className="lg:sticky lg:top-32">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="heading-lg text-foreground mt-3 mb-4">
              Pertanyaan yang Sering{" "}
              <span className="text-primary">Ditanyakan</span>
            </h2>
            <p className="body-md text-muted-foreground mb-6">
              Temukan jawaban untuk pertanyaan umum seputar layanan undangan
              digital kami
            </p>
            <p className="text-sm text-muted-foreground">
              Masih punya pertanyaan?{" "}
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                Hubungi kami via WhatsApp
              </a>
            </p>
          </div>

          {/* Right - Accordion */}
          <div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-soft transition-all"
                >
                  <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
