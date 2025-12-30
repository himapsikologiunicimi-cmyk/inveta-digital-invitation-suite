import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  Pencil,
  Trash2,
  Plus,
  Upload,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import { z } from "zod";

type OrderStatus = "pending_payment" | "payment_received" | "in_progress" | "completed";

interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  couple_names: string;
  couple_photo_url: string | null;
  theme_id: number;
  theme_name: string;
  payment_proof_url: string | null;
  payment_amount: number | null;
  payment_date: string | null;
  status: OrderStatus;
  invitation_link: string | null;
  notes: string | null;
  created_at: string;
}

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: "Menunggu Pembayaran",
  payment_received: "Pembayaran Diterima",
  in_progress: "Sedang Dibuat",
  completed: "Selesai",
};

const statusColors: Record<OrderStatus, string> = {
  pending_payment: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  payment_received: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
};

const customerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("payments");

  // Customer creation
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [customerErrors, setCustomerErrors] = useState<{ email?: string; password?: string; customerName?: string }>({});

  // Order editing
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCoupleName, setEditCoupleName] = useState("");
  const [editStatus, setEditStatus] = useState<OrderStatus>("pending_payment");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        } else {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      } else {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId: string) => {
    const { data: role, error } = await supabase.rpc('get_user_role', { _user_id: userId });
    
    if (error || role !== 'admin') {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Anda tidak memiliki akses admin.",
      });
      navigate("/customer-dashboard");
      return;
    }
    
    setIsLoading(false);
    fetchOrders();
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data pesanan",
      });
      return;
    }

    setOrders(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerErrors({});

    const result = customerSchema.safeParse({
      email: newEmail,
      password: newPassword,
      customerName: newCustomerName,
    });

    if (!result.success) {
      const fieldErrors: { email?: string; password?: string; customerName?: string } = {};
      result.error.errors.forEach((error) => {
        if (error.path[0] === "email") fieldErrors.email = error.message;
        if (error.path[0] === "password") fieldErrors.password = error.message;
        if (error.path[0] === "customerName") fieldErrors.customerName = error.message;
      });
      setCustomerErrors(fieldErrors);
      return;
    }

    setIsCreatingCustomer(true);

    try {
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: newCustomerName,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Add customer role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: "customer",
          });

        if (roleError) throw roleError;

        // Generate invitation link
        const invitationLink = `${window.location.origin}/invitation/${authData.user.id}`;

        toast({
          title: "Berhasil!",
          description: `Akun customer ${newEmail} berhasil dibuat`,
        });

        setNewEmail("");
        setNewPassword("");
        setNewCustomerName("");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal membuat akun customer",
      });
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ 
        status: "payment_received" as OrderStatus,
        payment_date: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengkonfirmasi pembayaran",
      });
      return;
    }

    toast({
      title: "Berhasil!",
      description: "Pembayaran berhasil dikonfirmasi",
    });

    fetchOrders();
  };

  const openEditDialog = (order: Order) => {
    setEditingOrder(order);
    setEditCoupleName(order.couple_names);
    setEditStatus(order.status);
    setEditPhotoFile(null);
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    let photoUrl = editingOrder.couple_photo_url;

    // Upload new photo if provided
    if (editPhotoFile) {
      const fileExt = editPhotoFile.name.split('.').pop();
      const fileName = `${editingOrder.id}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("order-photos")
        .upload(fileName, editPhotoFile);

      if (uploadError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal mengupload foto",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("order-photos")
        .getPublicUrl(fileName);

      photoUrl = publicUrl;
    }

    const { error } = await supabase
      .from("orders")
      .update({
        couple_names: editCoupleName,
        status: editStatus,
        couple_photo_url: photoUrl,
      })
      .eq("id", editingOrder.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengupdate pesanan",
      });
      return;
    }

    toast({
      title: "Berhasil!",
      description: "Pesanan berhasil diupdate",
    });

    setIsEditDialogOpen(false);
    fetchOrders();
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Yakin ingin menghapus pesanan ini?")) return;

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus pesanan",
      });
      return;
    }

    toast({
      title: "Berhasil!",
      description: "Pesanan berhasil dihapus",
    });

    fetchOrders();
  };

  const pendingPayments = orders.filter(o => o.status === "pending_payment" && o.payment_proof_url);
  const confirmedOrders = orders.filter(o => o.status !== "pending_payment");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Inveta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="heading-lg text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Selamat datang, {user?.email}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-yellow-500/10">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingPayments.length}</p>
                    <p className="text-sm text-muted-foreground">Menunggu Konfirmasi</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{orders.filter(o => o.status === "payment_received").length}</p>
                    <p className="text-sm text-muted-foreground">Pembayaran Dikonfirmasi</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{orders.filter(o => o.status === "in_progress").length}</p>
                    <p className="text-sm text-muted-foreground">Sedang Dikerjakan</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{orders.filter(o => o.status === "completed").length}</p>
                    <p className="text-sm text-muted-foreground">Selesai</p>
                  </div>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="payments" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Konfirmasi Pembayaran
                  {pendingPayments.length > 0 && (
                    <Badge variant="destructive" className="ml-1">{pendingPayments.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="clients" className="gap-2">
                  <Users className="w-4 h-4" />
                  Daftar Client
                </TabsTrigger>
                <TabsTrigger value="create-customer" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Buat Akun Customer
                </TabsTrigger>
              </TabsList>

              {/* Payments Tab */}
              <TabsContent value="payments">
                <div className="bg-card rounded-xl border border-border">
                  <div className="p-6 border-b border-border">
                    <h2 className="heading-sm text-foreground">Pembayaran Masuk</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Daftar pembayaran yang menunggu konfirmasi
                    </p>
                  </div>
                  
                  {pendingPayments.length === 0 ? (
                    <div className="p-12 text-center">
                      <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Tidak ada pembayaran yang menunggu konfirmasi</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Nama Pasangan</TableHead>
                          <TableHead>Tema</TableHead>
                          <TableHead>Bukti Bayar</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingPayments.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.customer_name}</TableCell>
                            <TableCell>{order.couple_names}</TableCell>
                            <TableCell>{order.theme_name}</TableCell>
                            <TableCell>
                              {order.payment_proof_url && (
                                <a
                                  href={order.payment_proof_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  Lihat
                                </a>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString("id-ID")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="hero"
                                size="sm"
                                onClick={() => handleConfirmPayment(order.id)}
                                className="gap-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Konfirmasi
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>

              {/* Clients Tab */}
              <TabsContent value="clients">
                <div className="bg-card rounded-xl border border-border">
                  <div className="p-6 border-b border-border">
                    <h2 className="heading-sm text-foreground">Daftar Client</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Semua pesanan yang sudah dikonfirmasi
                    </p>
                  </div>
                  
                  {confirmedOrders.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Belum ada client</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Foto</TableHead>
                          <TableHead>Nama Pasangan</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {confirmedOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              {order.couple_photo_url ? (
                                <img
                                  src={order.couple_photo_url}
                                  alt={order.couple_names}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                  <Users className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{order.couple_names}</TableCell>
                            <TableCell>{order.customer_name}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[order.status]}>
                                {statusLabels[order.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString("id-ID")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(order)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteOrder(order.id)}
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
                </div>
              </TabsContent>

              {/* Create Customer Tab */}
              <TabsContent value="create-customer">
                <div className="bg-card rounded-xl border border-border p-6 max-w-md">
                  <h2 className="heading-sm text-foreground mb-6">Buat Akun Customer Baru</h2>
                  
                  <form onSubmit={handleCreateCustomer} className="space-y-5">
                    <div>
                      <Label htmlFor="customerName">Nama Customer</Label>
                      <Input
                        id="customerName"
                        placeholder="Nama lengkap customer"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className={`mt-2 ${customerErrors.customerName ? "border-destructive" : ""}`}
                        disabled={isCreatingCustomer}
                      />
                      {customerErrors.customerName && (
                        <p className="mt-1 text-sm text-destructive">{customerErrors.customerName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="newEmail">Email</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className={`mt-2 ${customerErrors.email ? "border-destructive" : ""}`}
                        disabled={isCreatingCustomer}
                      />
                      {customerErrors.email && (
                        <p className="mt-1 text-sm text-destructive">{customerErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="newPassword">Password</Label>
                      <div className="relative mt-2">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Minimal 6 karakter"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`pr-10 ${customerErrors.password ? "border-destructive" : ""}`}
                          disabled={isCreatingCustomer}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {customerErrors.password && (
                        <p className="mt-1 text-sm text-destructive">{customerErrors.password}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isCreatingCustomer}
                    >
                      {isCreatingCustomer ? (
                        "Memproses..."
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Buat Akun Customer
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Catatan:</strong> Setelah akun dibuat, customer dapat login dan akan melihat link undangan yang tergenerate otomatis di dashboard mereka.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Edit Order Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Pesanan</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="editCoupleName">Nama Pasangan</Label>
                    <Input
                      id="editCoupleName"
                      value={editCoupleName}
                      onChange={(e) => setEditCoupleName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <Select value={editStatus} onValueChange={(value) => setEditStatus(value as OrderStatus)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending_payment">Menunggu Pembayaran</SelectItem>
                        <SelectItem value="payment_received">Pembayaran Diterima</SelectItem>
                        <SelectItem value="in_progress">Sedang Dibuat</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="editPhoto">Foto Pasangan</Label>
                    <div className="mt-2">
                      {editingOrder?.couple_photo_url && (
                        <img
                          src={editingOrder.couple_photo_url}
                          alt="Current"
                          className="w-24 h-24 rounded-lg object-cover mb-2"
                        />
                      )}
                      <Input
                        id="editPhoto"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditPhotoFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="hero"
                      className="flex-1"
                      onClick={handleUpdateOrder}
                    >
                      Simpan
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminDashboard;