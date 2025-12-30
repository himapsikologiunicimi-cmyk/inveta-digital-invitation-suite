import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { OrderData } from "@/pages/Order";
import {
  CheckCircle2,
  Copy,
  FileText,
  MessageCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const bankAccounts = [
  { bank: "BCA", number: "1234567890", name: "PT Inveta Digital Indonesia" },
  { bank: "Mandiri", number: "9876543210", name: "PT Inveta Digital Indonesia" },
];

const Invoice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("orderData");
    if (stored) {
      setOrderData(JSON.parse(stored));
    } else {
      navigate("/katalog");
    }
  }, [navigate]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({
      title: "Berhasil disalin!",
      description: `${label} telah disalin ke clipboard`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleWhatsAppConfirm = () => {
    if (!orderData) return;

    const message = encodeURIComponent(
      `Hallo Admin Inveta,
Saya telah melakukan pemesanan undangan digital.

Nama: ${orderData.customerName}
Tema: ${orderData.theme.name}
Harga: ${formatPrice(orderData.total)}
Metode Pembayaran: ${orderData.paymentMethod === "bank" ? "Transfer Bank" : "QRIS"}
Kode Pesanan: ${orderData.orderCode}

Mohon dicek dan diproses. Terima kasih.`
    );

    window.open(`https://wa.me/6281234567890?text=${message}`, "_blank");
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat data pesanan...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Invoice Pesanan #{orderData.orderCode} | Inveta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-muted/50">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container-custom max-w-3xl">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="heading-lg text-foreground mb-2">Pesanan Berhasil Dibuat!</h1>
              <p className="text-muted-foreground">
                Silakan lakukan pembayaran untuk mengaktifkan undangan Anda
              </p>
            </div>

            {/* Invoice Card */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-elevated">
              {/* Invoice Header */}
              <div className="bg-hero-gradient p-6 text-primary-foreground">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    <div>
                      <p className="text-sm text-primary-foreground/80">Kode Pesanan</p>
                      <p className="font-bold text-lg">{orderData.orderCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">Berlaku 24 jam</span>
                  </div>
                </div>
              </div>

              {/* Invoice Body */}
              <div className="p-6 space-y-6">
                {/* Order Details */}
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    Detail Pesanan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Nama Pemesan</span>
                      <span className="font-medium">{orderData.customerName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{orderData.customerEmail}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">WhatsApp</span>
                      <span className="font-medium">{orderData.customerPhone}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Tema Undangan</span>
                      <span className="font-medium">{orderData.theme.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Metode Pembayaran</span>
                      <span className="font-medium">
                        {orderData.paymentMethod === "bank" ? "Transfer Bank" : "QRIS"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    Ringkasan Pembayaran
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(orderData.subtotal)}</span>
                    </div>
                    {orderData.discount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Diskon</span>
                        <span>- {formatPrice(orderData.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kode Unik</span>
                      <span>{formatPrice(orderData.uniqueCode)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border">
                      <span className="font-semibold text-lg">Total Bayar</span>
                      <span className="font-bold text-xl text-primary">
                        {formatPrice(orderData.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Instructions */}
                {orderData.paymentMethod === "bank" && (
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Instruksi Pembayaran
                    </h3>
                    <div className="space-y-4">
                      {bankAccounts.map((account) => (
                        <div
                          key={account.bank}
                          className="p-4 bg-muted/50 rounded-xl border border-border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-foreground">
                              {account.bank}
                            </span>
                            <button
                              onClick={() => handleCopy(account.number, `Nomor ${account.bank}`)}
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <Copy className="w-4 h-4" />
                              {copied === `Nomor ${account.bank}` ? "Tersalin!" : "Salin"}
                            </button>
                          </div>
                          <p className="text-lg font-mono font-bold text-foreground">
                            {account.number}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            a.n. {account.name}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Amount to Transfer */}
                    <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Transfer tepat sebesar:
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {formatPrice(orderData.total)}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleCopy(orderData.total.toString(), "Nominal")
                          }
                          className="flex items-center gap-1 px-4 py-2 bg-primary/10 rounded-lg text-sm text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          Salin
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        * Pastikan transfer sesuai nominal (termasuk kode unik) agar pembayaran
                        terverifikasi otomatis
                      </p>
                    </div>
                  </div>
                )}

                {orderData.paymentMethod === "qris" && (
                  <div className="text-center p-6 bg-muted/50 rounded-xl">
                    <p className="text-muted-foreground mb-4">
                      Kode QRIS akan dikirimkan via WhatsApp setelah konfirmasi
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="pt-4">
                  <Button
                    variant="whatsapp"
                    size="xl"
                    className="w-full gap-3"
                    onClick={handleWhatsAppConfirm}
                  >
                    <MessageCircle className="w-6 h-6" />
                    Konfirmasi Pembayaran via WhatsApp
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Klik tombol di atas untuk konfirmasi pembayaran ke admin
                  </p>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Butuh bantuan?{" "}
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Hubungi Admin
                </a>
              </p>
            </div>
          </div>
        </main>

        <Footer />
        <WhatsAppFloat />
      </div>
    </>
  );
};

export default Invoice;
