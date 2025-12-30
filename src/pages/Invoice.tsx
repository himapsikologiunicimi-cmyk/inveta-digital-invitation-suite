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
  Calendar,
  User,
  Building2,
  Package,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const banks = [
  { id: "bca", name: "BCA", number: "1234567890", holder: "PT Inveta Digital Indonesia" },
  { id: "mandiri", name: "Mandiri", number: "9876543210", holder: "PT Inveta Digital Indonesia" },
  { id: "bni", name: "BNI", number: "0987654321", holder: "PT Inveta Digital Indonesia" },
  { id: "bri", name: "BRI", number: "1122334455", holder: "PT Inveta Digital Indonesia" },
];

const Invoice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [qrisImage, setQrisImage] = useState<string | null>(null);
  const [qrisLoading, setQrisLoading] = useState(false);
  const [qrisError, setQrisError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("orderData");
    if (stored) {
      const data = JSON.parse(stored) as OrderData;
      setOrderData(data);
      
      // Generate QRIS if payment method is QRIS
      if (data.paymentMethod === "qris") {
        generateQris(data.total);
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const generateQris = async (amount: number) => {
    setQrisLoading(true);
    setQrisError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-qris', {
        body: { amount },
      });

      if (error) {
        console.error('Error invoking QRIS function:', error);
        setQrisError('Gagal generate QRIS. Silakan hubungi admin.');
        return;
      }

      if (data.status === 'success' && data.qris_base64) {
        setQrisImage(data.qris_base64);
      } else {
        setQrisError(data.message || 'Gagal generate QRIS');
      }
    } catch (error) {
      console.error('Error generating QRIS:', error);
      setQrisError('Terjadi kesalahan. Silakan hubungi admin.');
    } finally {
      setQrisLoading(false);
    }
  };

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

    const selectedBankInfo = orderData.selectedBank 
      ? banks.find(b => b.id === orderData.selectedBank)
      : null;

    const message = encodeURIComponent(
      `Hallo Admin Inveta,
Saya telah melakukan pemesanan undangan digital.

*DETAIL PESANAN*
Kode Pesanan: ${orderData.orderCode}
Nama: ${orderData.customerName}
Email: ${orderData.customerEmail}
WhatsApp: ${orderData.customerPhone}

*PRODUK*
Tema: ${orderData.theme.name}
${orderData.addOnDetails && orderData.addOnDetails.length > 0 
  ? `Add On: ${orderData.addOnDetails.map(a => a.name).join(', ')}` 
  : ''}

*PEMBAYARAN*
Metode: ${orderData.paymentMethod === "bank" ? `Transfer Bank ${selectedBankInfo?.name || ''}` : "QRIS"}
Total: ${formatPrice(orderData.total)}

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

  const selectedBankInfo = orderData.selectedBank 
    ? banks.find(b => b.id === orderData.selectedBank)
    : null;

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
              {/* Invoice Header with Logo */}
              <div className="bg-hero-gradient p-6 text-primary-foreground">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                      <span className="font-display text-xl font-bold">IV</span>
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold">Inveta</h2>
                      <p className="text-sm text-primary-foreground/80">Undangan Digital Premium</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary-foreground/80">Kode Pesanan</p>
                    <p className="font-bold text-lg">{orderData.orderCode}</p>
                  </div>
                </div>
              </div>

              {/* Date Info */}
              <div className="p-6 bg-muted/30 border-b border-border">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tanggal Pesanan</p>
                      <p className="font-medium text-foreground">
                        {formatDate(orderData.orderDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-sm text-muted-foreground">Batas Pembayaran</p>
                      <p className="font-medium text-destructive">
                        {formatDate(orderData.orderDeadline)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Body */}
              <div className="p-6 space-y-6">
                {/* Issuer Info */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-primary" />
                      <h4 className="font-medium text-foreground">Diterbitkan Untuk</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-foreground">{orderData.customerName}</p>
                      <p className="text-muted-foreground">{orderData.customerEmail}</p>
                      <p className="text-muted-foreground">{orderData.customerPhone}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-primary" />
                      <h4 className="font-medium text-foreground">Diterbitkan Oleh</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-foreground">PT Inveta Digital Indonesia</p>
                      <p className="text-muted-foreground">admin@inveta.id</p>
                      <p className="text-muted-foreground">+62 812 3456 7890</p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Detail Pesanan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Tema Undangan</span>
                      <span className="font-medium">{orderData.theme.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Masa Aktif</span>
                      <span className="font-medium">1 Tahun</span>
                    </div>
                    {orderData.addOnDetails && orderData.addOnDetails.length > 0 && (
                      <div className="py-2 border-b border-border">
                        <span className="text-muted-foreground">Add On:</span>
                        <div className="mt-2 space-y-1">
                          {orderData.addOnDetails.map((addon) => (
                            <div key={addon.id} className="flex justify-between text-sm">
                              <span className="text-foreground">• {addon.name}</span>
                              <span className="font-medium">{formatPrice(addon.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Summary */}
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Ringkasan Pembayaran
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Status Pembayaran</span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        Menunggu Pembayaran
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Metode Pembayaran</span>
                      <span className="font-medium">
                        {orderData.paymentMethod === "bank" 
                          ? `Transfer Bank ${selectedBankInfo?.name || ''}`
                          : "QRIS"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Harga Paket ({orderData.theme.name})</span>
                      <span>{formatPrice(orderData.theme.price)}</span>
                    </div>
                    {orderData.addOnDetails && orderData.addOnDetails.length > 0 && (
                      <div className="py-2 border-b border-border">
                        <span className="text-muted-foreground font-medium">Add On</span>
                        <div className="mt-1 space-y-1">
                          {orderData.addOnDetails.map((addon) => (
                            <div key={addon.id} className="flex justify-between pl-4">
                              <span className="text-muted-foreground">{addon.name}</span>
                              <span>{formatPrice(addon.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {orderData.discount > 0 && (
                      <div className="flex justify-between py-2 border-b border-border text-primary">
                        <span>Diskon</span>
                        <span>- {formatPrice(orderData.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Kode Unik</span>
                      <span>{formatPrice(orderData.uniqueCode)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(orderData.subtotal)}</span>
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
                {orderData.paymentMethod === "bank" && selectedBankInfo && (
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                      Instruksi Pembayaran
                    </h3>
                    <div className="p-4 bg-muted/50 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">
                          {selectedBankInfo.name}
                        </span>
                        <button
                          onClick={() => handleCopy(selectedBankInfo.number, `Nomor ${selectedBankInfo.name}`)}
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Copy className="w-4 h-4" />
                          {copied === `Nomor ${selectedBankInfo.name}` ? "Tersalin!" : "Salin"}
                        </button>
                      </div>
                      <p className="text-lg font-mono font-bold text-foreground">
                        {selectedBankInfo.number}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        a.n. {selectedBankInfo.holder}
                      </p>
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
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                      Pembayaran QRIS
                    </h3>
                    <div className="p-6 bg-muted/50 rounded-xl border border-border text-center">
                      {qrisLoading && (
                        <div className="py-8">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-muted-foreground">Generating QRIS...</p>
                        </div>
                      )}
                      
                      {qrisError && (
                        <div className="py-8">
                          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                          <p className="text-destructive mb-4">{qrisError}</p>
                          <Button 
                            variant="outline" 
                            onClick={() => generateQris(orderData.total)}
                          >
                            Coba Lagi
                          </Button>
                        </div>
                      )}

                      {qrisImage && !qrisLoading && !qrisError && (
                        <>
                          <img 
                            src={`data:image/png;base64,${qrisImage}`} 
                            alt="QRIS Payment"
                            className="w-64 h-64 mx-auto mb-4 rounded-lg"
                          />
                          <p className="text-2xl font-bold text-primary mb-2">
                            {formatPrice(orderData.total)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Scan QRIS di atas untuk melakukan pembayaran
                          </p>
                        </>
                      )}
                    </div>
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