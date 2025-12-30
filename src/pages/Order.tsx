import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { themes, Theme } from "@/components/CatalogSection";
import {
  Check,
  Clock,
  CreditCard,
  Gift,
  ShieldCheck,
  Tag,
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const addOns = [
  { id: "tambah-5-foto", name: "Tambah 5 Foto", price: 25000 },
  { id: "tambah-video", name: "Tambah Video", price: 50000 },
  { id: "custom-domain", name: "Custom Domain", price: 150000 },
  { id: "extra-3-months", name: "Perpanjang 3 Bulan", price: 50000 },
  { id: "extra-6-months", name: "Perpanjang 6 Bulan", price: 75000 },
  { id: "live-streaming", name: "Fitur Live Streaming", price: 100000 },
];

const banks = [
  { id: "bca", name: "BCA", number: "1234567890", holder: "PT Inveta Digital Indonesia" },
  { id: "mandiri", name: "Mandiri", number: "9876543210", holder: "PT Inveta Digital Indonesia" },
  { id: "bni", name: "BNI", number: "0987654321", holder: "PT Inveta Digital Indonesia" },
  { id: "bri", name: "BRI", number: "1122334455", holder: "PT Inveta Digital Indonesia" },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const generateOrderCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "INV-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const generateUniqueCode = () => {
  return Math.floor(Math.random() * 999) + 1;
};

export interface OrderData {
  theme: Theme;
  addOns: string[];
  addOnDetails: { id: string; name: string; price: number }[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  selectedBank: string | null;
  couponCode: string;
  orderCode: string;
  uniqueCode: number;
  subtotal: number;
  discount: number;
  total: number;
  orderDate: string;
  orderDeadline: string;
}

const Order = () => {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    const theme = themes.find((t) => t.id === Number(themeId));
    if (theme) {
      setSelectedTheme(theme);
    }
  }, [themeId]);

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateSubtotal = () => {
    if (!selectedTheme) return 0;
    const themePrice = selectedTheme.price;
    const addOnsTotal = selectedAddOns.reduce((sum, id) => {
      const addOn = addOns.find((a) => a.id === id);
      return sum + (addOn?.price || 0);
    }, 0);
    return themePrice + addOnsTotal;
  };

  const handleApplyCoupon = () => {
    setIsApplyingCoupon(true);
    setTimeout(() => {
      if (couponCode.toUpperCase() === "DISKON10") {
        setDiscount(calculateSubtotal() * 0.1);
      } else if (couponCode.toUpperCase() === "DISKON20") {
        setDiscount(calculateSubtotal() * 0.2);
      } else {
        setDiscount(0);
      }
      setIsApplyingCoupon(false);
    }, 500);
  };

  const subtotal = calculateSubtotal();
  const uniqueCode = generateUniqueCode();
  const total = subtotal - discount + uniqueCode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTheme || !customerName || !customerEmail || !customerPhone) {
      return;
    }

    if (paymentMethod === "bank" && !selectedBank) {
      return;
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const addOnDetails = selectedAddOns.map((id) => {
      const addOn = addOns.find((a) => a.id === id);
      return addOn ? { id: addOn.id, name: addOn.name, price: addOn.price } : null;
    }).filter(Boolean) as { id: string; name: string; price: number }[];

    const orderData: OrderData = {
      theme: selectedTheme,
      addOns: selectedAddOns,
      addOnDetails,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
      selectedBank: paymentMethod === "bank" ? selectedBank : null,
      couponCode,
      orderCode: generateOrderCode(),
      uniqueCode,
      subtotal,
      discount,
      total,
      orderDate: now.toISOString(),
      orderDeadline: deadline.toISOString(),
    };

    sessionStorage.setItem("orderData", JSON.stringify(orderData));
    navigate("/invoice");
  };

  if (!selectedTheme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Tema tidak ditemukan</p>
      </div>
    );
  }

  const OrderSummary = () => (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="heading-sm text-foreground mb-6">Ringkasan Pesanan</h2>

      <div className="space-y-4 pb-4 border-b border-border">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{selectedTheme.name}</span>
          <span className="font-medium">{formatPrice(selectedTheme.price)}</span>
        </div>
        {selectedAddOns.map((id) => {
          const addOn = addOns.find((a) => a.id === id);
          return (
            addOn && (
              <div key={id} className="flex justify-between">
                <span className="text-muted-foreground">{addOn.name}</span>
                <span className="font-medium">+ {formatPrice(addOn.price)}</span>
              </div>
            )
          );
        })}
      </div>

      <div className="space-y-3 py-4 border-b border-border">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-primary">
            <span>Diskon</span>
            <span>- {formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Kode Unik</span>
          <span className="font-medium">{formatPrice(uniqueCode)}</span>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <span className="font-semibold text-lg">Total Bayar</span>
        <span className="font-bold text-xl text-primary">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Pesan Undangan {selectedTheme.name} | Inveta</title>
        <meta
          name="description"
          content={`Pesan undangan digital tema ${selectedTheme.name} dari Inveta. Lengkapi data dan mulai buat undangan impian Anda.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container-custom">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left - Order Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Product Info */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Tag className="w-5 h-5 text-primary" />
                    <h2 className="heading-sm text-foreground">Informasi Produk</h2>
                  </div>

                  <div className="flex gap-6">
                    <img
                      src={selectedTheme.image}
                      alt={selectedTheme.name}
                      className="w-32 h-40 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-primary font-medium">Inveta</span>
                      <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                        {selectedTheme.name}
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-muted-foreground line-through">
                          {formatPrice(selectedTheme.originalPrice)}
                        </span>
                        <span className="text-primary font-bold text-xl">
                          {formatPrice(selectedTheme.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Masa Aktif: 1 Tahun
                        </span>
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" />
                          Garansi Revisi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-medium text-foreground mb-3">Fitur yang didapat:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTheme.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Ons */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Gift className="w-5 h-5 text-primary" />
                    <h2 className="heading-sm text-foreground">Add On / Tambahan</h2>
                  </div>

                  <div className="space-y-4">
                    {addOns.map((addOn) => (
                      <div
                        key={addOn.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                          selectedAddOns.includes(addOn.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={addOn.id}
                            checked={selectedAddOns.includes(addOn.id)}
                            onCheckedChange={() => handleAddOnToggle(addOn.id)}
                          />
                          <Label htmlFor={addOn.id} className="cursor-pointer">
                            {addOn.name}
                          </Label>
                        </div>
                        <span className="font-semibold text-foreground">
                          + {formatPrice(addOn.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="heading-sm text-foreground mb-6">Detail Akun Pemesan</h2>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nama Lengkap *</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Masukkan nama lengkap"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Masukkan email aktif"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="mt-2"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email harus aktif untuk menerima informasi pesanan
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="phone">Nomor WhatsApp *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="08xx-xxxx-xxxx"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="mt-2"
                          required
                        />
                        <p className="text-xs text-destructive mt-1">
                          WhatsApp harus aktif, jangan salah tulis nomor WA!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <h2 className="heading-sm text-foreground">Metode Pembayaran</h2>
                    </div>

                    <RadioGroup value={paymentMethod} onValueChange={(value) => {
                      setPaymentMethod(value);
                      if (value === "qris") {
                        setSelectedBank(null);
                        setIsBankOpen(false);
                      }
                    }}>
                      <div className="space-y-4">
                        {/* Bank Transfer Option */}
                        <Collapsible open={isBankOpen} onOpenChange={setIsBankOpen}>
                          <div
                            className={`rounded-xl border transition-colors ${
                              paymentMethod === "bank"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <CollapsibleTrigger asChild>
                              <div
                                className="flex items-center justify-between p-4 cursor-pointer"
                                onClick={() => {
                                  setPaymentMethod("bank");
                                  setIsBankOpen(true);
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <RadioGroupItem value="bank" id="bank" />
                                  <Label htmlFor="bank" className="cursor-pointer">
                                    Transfer Bank
                                  </Label>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isBankOpen ? "rotate-180" : ""}`} />
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-4 pb-4 space-y-2">
                                {banks.map((bank) => (
                                  <div
                                    key={bank.id}
                                    onClick={() => setSelectedBank(bank.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                      selectedBank === bank.id
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:border-primary/30"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-foreground">{bank.name}</span>
                                      {selectedBank === bank.id && (
                                        <Check className="w-4 h-4 text-primary" />
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{bank.number}</p>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>

                        {/* QRIS Option */}
                        <div
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                            paymentMethod === "qris"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                          onClick={() => setPaymentMethod("qris")}
                        >
                          <RadioGroupItem value="qris" id="qris" />
                          <Label htmlFor="qris" className="cursor-pointer">
                            QRIS
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Coupon */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="heading-sm text-foreground mb-4">Kode Kupon</h2>
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="Masukkan kode kupon"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode}
                      >
                        {isApplyingCoupon ? "Mengecek..." : "Terapkan"}
                      </Button>
                    </div>
                    {discount > 0 && (
                      <p className="mt-2 text-sm text-primary">
                        ✓ Kupon berhasil diterapkan! Diskon {formatPrice(discount)}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Coba: DISKON10 atau DISKON20
                    </p>
                  </div>

                  {/* Mobile Order Summary & Submit */}
                  <div className="lg:hidden space-y-4">
                    <OrderSummary />
                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="xl" 
                      className="w-full"
                      disabled={!customerName || !customerEmail || !customerPhone || (paymentMethod === "bank" && !selectedBank)}
                    >
                      Order Sekarang
                    </Button>
                  </div>
                </form>
              </div>

              {/* Right - Order Summary (Sticky) */}
              <div className="lg:col-span-1 hidden lg:block">
                <div className="sticky top-28 space-y-4">
                  <OrderSummary />
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={!customerName || !customerEmail || !customerPhone || (paymentMethod === "bank" && !selectedBank)}
                  >
                    Order Sekarang
                  </Button>

                  <div className="text-center space-y-2 pt-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Transaksi 100% Aman</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Data Anda dilindungi dan tidak akan dibagikan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <WhatsAppFloat />
      </div>
    </>
  );
};

export default Order;