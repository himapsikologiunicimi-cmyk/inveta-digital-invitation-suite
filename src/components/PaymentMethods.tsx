import { CreditCard } from "lucide-react";

const banks = [
  { name: "BCA", color: "#0066AE" },
  { name: "Mandiri", color: "#003868" },
  { name: "BNI", color: "#F15A22" },
  { name: "BRI", color: "#00529C" },
];

const ewallets = [
  { name: "QRIS", color: "#E31E25" },
  { name: "GoPay", color: "#00AED6" },
  { name: "OVO", color: "#4C3494" },
  { name: "DANA", color: "#108EE9" },
];

const PaymentMethods = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Pembayaran
          </span>
          <h2 className="heading-md text-foreground mt-3">
            Metode <span className="text-primary">Pembayaran</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Banks */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-muted-foreground text-center mb-4">
              Transfer Bank
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {banks.map((bank) => (
                <div
                  key={bank.name}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <CreditCard className="w-5 h-5" style={{ color: bank.color }} />
                  <span className="font-semibold" style={{ color: bank.color }}>
                    {bank.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* E-Wallets */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground text-center mb-4">
              E-Wallet & QRIS
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {ewallets.map((wallet) => (
                <div
                  key={wallet.name}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: wallet.color }}
                  />
                  <span className="font-semibold text-foreground">{wallet.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentMethods;
