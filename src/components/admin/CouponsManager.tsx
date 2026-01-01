import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, Ticket, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

const CouponsManager = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formMinOrder, setFormMinOrder] = useState("");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formValidUntil, setFormValidUntil] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data kupon",
      });
      return;
    }

    setCoupons((data as Coupon[]) || []);
    setIsLoading(false);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormCode(code);
  };

  const openCreateDialog = () => {
    setEditingCoupon(null);
    setFormCode("");
    setFormDiscountType("percentage");
    setFormDiscountValue("");
    setFormMinOrder("");
    setFormMaxUses("");
    setFormValidUntil("");
    setFormIsActive(true);
    setIsDialogOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormCode(coupon.code);
    setFormDiscountType(coupon.discount_type);
    setFormDiscountValue(coupon.discount_value.toString());
    setFormMinOrder(coupon.min_order_amount?.toString() || "");
    setFormMaxUses(coupon.max_uses?.toString() || "");
    setFormValidUntil(coupon.valid_until ? coupon.valid_until.split("T")[0] : "");
    setFormIsActive(coupon.is_active);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formCode.trim() || !formDiscountValue) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Kode kupon dan nilai diskon wajib diisi",
      });
      return;
    }

    setIsSaving(true);

    const couponData = {
      code: formCode.trim().toUpperCase(),
      discount_type: formDiscountType,
      discount_value: parseFloat(formDiscountValue),
      min_order_amount: formMinOrder ? parseFloat(formMinOrder) : null,
      max_uses: formMaxUses ? parseInt(formMaxUses) : null,
      valid_until: formValidUntil ? new Date(formValidUntil).toISOString() : null,
      is_active: formIsActive,
    };

    if (editingCoupon) {
      // Update existing coupon
      const { error } = await supabase
        .from("coupons")
        .update(couponData)
        .eq("id", editingCoupon.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message.includes("duplicate") 
            ? "Kode kupon sudah digunakan" 
            : "Gagal mengupdate kupon",
        });
        setIsSaving(false);
        return;
      }

      toast({
        title: "Berhasil!",
        description: "Kupon berhasil diupdate",
      });
    } else {
      // Create new coupon
      const { error } = await supabase.from("coupons").insert(couponData);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message.includes("duplicate") 
            ? "Kode kupon sudah digunakan" 
            : "Gagal membuat kupon baru",
        });
        setIsSaving(false);
        return;
      }

      toast({
        title: "Berhasil!",
        description: "Kupon baru berhasil dibuat",
      });
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    fetchCoupons();
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("Yakin ingin menghapus kupon ini?")) return;

    const { error } = await supabase.from("coupons").delete().eq("id", couponId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus kupon",
      });
      return;
    }

    toast({
      title: "Berhasil!",
      description: "Kupon berhasil dihapus",
    });

    fetchCoupons();
  };

  const toggleActive = async (coupon: Coupon) => {
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !coupon.is_active })
      .eq("id", coupon.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengubah status kupon",
      });
      return;
    }

    fetchCoupons();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}%`;
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(coupon.discount_value);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="heading-sm text-foreground">Kelola Kupon</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Buat dan kelola kupon diskon
          </p>
        </div>
        <Button variant="hero" onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <div className="p-12 text-center">
          <Ticket className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Belum ada kupon</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Diskon</TableHead>
              <TableHead>Min. Order</TableHead>
              <TableHead>Penggunaan</TableHead>
              <TableHead>Berlaku Sampai</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {coupon.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => copyCode(coupon.code)}
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{formatDiscount(coupon)}</Badge>
                </TableCell>
                <TableCell>
                  {coupon.min_order_amount
                    ? formatPrice(coupon.min_order_amount)
                    : "-"}
                </TableCell>
                <TableCell>
                  {coupon.current_uses}
                  {coupon.max_uses && ` / ${coupon.max_uses}`}
                </TableCell>
                <TableCell>
                  {coupon.valid_until ? (
                    <span className={isExpired(coupon.valid_until) ? "text-destructive" : ""}>
                      {new Date(coupon.valid_until).toLocaleDateString("id-ID")}
                      {isExpired(coupon.valid_until) && " (Expired)"}
                    </span>
                  ) : (
                    "Selamanya"
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={coupon.is_active}
                    onCheckedChange={() => toggleActive(coupon)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(coupon)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Edit Kupon" : "Tambah Kupon Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="couponCode">Kode Kupon *</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="couponCode"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="DISKON20"
                  className="flex-1 font-mono"
                />
                <Button type="button" variant="outline" onClick={generateCode}>
                  Generate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">Tipe Diskon</Label>
                <Select
                  value={formDiscountType}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setFormDiscountType(value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                    <SelectItem value="fixed">Nominal (IDR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discountValue">Nilai Diskon *</Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formDiscountValue}
                  onChange={(e) => setFormDiscountValue(e.target.value)}
                  placeholder={formDiscountType === "percentage" ? "20" : "50000"}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minOrder">Min. Order (IDR)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={formMinOrder}
                  onChange={(e) => setFormMinOrder(e.target.value)}
                  placeholder="100000"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="maxUses">Maks. Penggunaan</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formMaxUses}
                  onChange={(e) => setFormMaxUses(e.target.value)}
                  placeholder="Tak terbatas"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="validUntil">Berlaku Sampai</Label>
              <Input
                id="validUntil"
                type="date"
                value={formValidUntil}
                onChange={(e) => setFormValidUntil(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Kosongkan untuk kupon selamanya
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="couponActive">Status Aktif</Label>
              <Switch
                id="couponActive"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsManager;
