import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users,
  MessageSquare,
  Eye,
  Plus,
  Trash2,
  Link as LinkIcon,
  FileText,
  LogOut,
  Edit3,
} from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SalutationType = "yth" | "kepada_yth" | "dear";
type GreetingType = "formal" | "muslim" | "nasrani" | "hindu" | "ultah";

const salutationOptions = [
  { value: "yth", label: "Yth." },
  { value: "kepada_yth", label: "Kepada Yth." },
  { value: "dear", label: "Dear" },
];

const greetingOptions = [
  { value: "formal", label: "Formal" },
  { value: "muslim", label: "Muslim" },
  { value: "nasrani", label: "Nasrani" },
  { value: "hindu", label: "Hindu" },
  { value: "ultah", label: "Ulang Tahun" },
];

const greetingTemplates: Record<GreetingType, string> = {
  formal: `Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.`,
  muslim: `Assalamualaikum Warahmatullahi Wabarakatuh

Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Wassalamualaikum Warahmatullahi Wabarakatuh`,
  nasrani: `Salam sejahtera dalam Kasih Kristus

Dengan penuh sukacita dan ucapan syukur kepada Tuhan Yang Maha Esa, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri pemberkatan pernikahan kami.

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Tuhan Memberkati`,
  hindu: `Om Swastiastu

Dengan Anugerah Ida Sang Hyang Widhi Wasa, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri upacara pernikahan kami.

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Om Shanti Shanti Shanti Om`,
  ultah: `Halo!

Dengan penuh sukacita, kami mengundang untuk hadir merayakan hari ulang tahun bersama kami.

Kehadiran dan doa akan menjadi hadiah terindah untuk kami.

Sampai jumpa di hari bahagia!`,
};

interface Guest {
  id: string;
  name: string;
  slug: string;
  invitation_id: string;
}

interface Invitation {
  id: string;
  salutation: SalutationType;
  greeting_type: GreetingType;
  theme_name: string;
}

interface Order {
  id: string;
  invitation_link: string;
  customer_name: string;
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [salutation, setSalutation] = useState<SalutationType>("yth");
  const [greetingType, setGreetingType] = useState<GreetingType>("formal");
  const [guestNames, setGuestNames] = useState("");
  const [customGreeting, setCustomGreeting] = useState("");
  const [isEditingGreeting, setIsEditingGreeting] = useState(false);

  // Guest List State
  const [guests, setGuests] = useState<Guest[]>([]);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  
  // Order State (from admin)
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Update custom greeting when template changes
  useEffect(() => {
    if (!isEditingGreeting) {
      setCustomGreeting(greetingTemplates[greetingType]);
    }
  }, [greetingType, isEditingGreeting]);

  const fetchData = async (userId: string) => {
    // Fetch order (invitation link from admin)
    const { data: orderData } = await supabase
      .from("orders")
      .select("id, invitation_link, customer_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (orderData) {
      setOrder(orderData);
    }

    // Fetch existing invitation
    const { data: invData, error: invError } = await supabase
      .from("invitations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (invData && !invError) {
      setInvitation(invData as Invitation);
      setSalutation((invData.salutation as SalutationType) || "yth");
      setGreetingType((invData.greeting_type as GreetingType) || "formal");
      
      // Fetch guests
      const { data: guestsData } = await supabase
        .from("guests")
        .select("*")
        .eq("invitation_id", invData.id)
        .order("created_at", { ascending: true });

      if (guestsData) {
        setGuests(guestsData);
      }
    }
  };

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleCreateGuestList = async () => {
    if (!user || !guestNames.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Silakan masukkan nama tamu terlebih dahulu",
      });
      return;
    }

    setIsCreating(true);

    try {
      let currentInvitation = invitation;

      // Create invitation if not exists
      if (!currentInvitation) {
        const { data: newInv, error: invError } = await supabase
          .from("invitations")
          .insert({
            user_id: user.id,
            theme_id: 1,
            theme_name: "Default Theme",
            salutation: salutation,
            greeting_type: greetingType,
          })
          .select()
          .single();

        if (invError) throw invError;
        currentInvitation = newInv as Invitation;
        setInvitation(currentInvitation);
      } else {
        // Update existing invitation with new settings
        await supabase
          .from("invitations")
          .update({
            salutation: salutation,
            greeting_type: greetingType,
          })
          .eq("id", currentInvitation.id);
      }

      // Parse guest names (split by newline)
      const names = guestNames
        .split("\n")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      // Create guests
      const guestsToInsert = names.map((name) => ({
        invitation_id: currentInvitation!.id,
        user_id: user.id,
        name: name,
        slug: createSlug(name),
      }));

      const { data: newGuests, error: guestError } = await supabase
        .from("guests")
        .insert(guestsToInsert)
        .select();

      if (guestError) throw guestError;

      toast({
        title: "Berhasil!",
        description: `${names.length} tamu berhasil ditambahkan`,
      });

      setGuests([...guests, ...(newGuests || [])]);
      setGuestNames("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal membuat daftar tamu",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    try {
      const { error } = await supabase
        .from("guests")
        .delete()
        .eq("id", guestId);

      if (error) throw error;

      setGuests(guests.filter((g) => g.id !== guestId));
      toast({
        title: "Berhasil",
        description: "Tamu berhasil dihapus",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal menghapus tamu",
      });
    }
  };

  const getInvitationLink = (guest: Guest) => {
    // Use order invitation link if available, otherwise use generated link
    if (order?.invitation_link) {
      return `${order.invitation_link}?to=${encodeURIComponent(guest.name)}`;
    }
    const baseUrl = window.location.origin;
    return `${baseUrl}/invitation/${invitation?.id}/${guest.slug}`;
  };

  const getShareText = (guest: Guest) => {
    const salutationText = salutationOptions.find(s => s.value === salutation)?.label || "Yth.";
    const greetingText = customGreeting || greetingTemplates[greetingType];
    const link = getInvitationLink(guest);
    
    return `${salutationText} Bapak/Ibu/Saudara/i\n${guest.name}\n\n${greetingText}\n\nLink Undangan:\n${link}`;
  };

  const handleShareWhatsApp = (guest: Guest) => {
    const text = encodeURIComponent(getShareText(guest));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCopyLink = (guest: Guest) => {
    navigator.clipboard.writeText(getInvitationLink(guest));
    toast({
      title: "Disalin!",
      description: "Link undangan berhasil disalin",
    });
  };

  const handleCopyText = (guest: Guest) => {
    navigator.clipboard.writeText(getShareText(guest));
    toast({
      title: "Disalin!",
      description: "Teks undangan berhasil disalin",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getPreviewText = () => {
    const sampleName = guestNames.split("\n")[0]?.trim() || guests[0]?.name || "Nama Tamu";
    const salutationText = salutationOptions.find(s => s.value === salutation)?.label || "Yth.";
    const greetingText = customGreeting || greetingTemplates[greetingType];
    const link = order?.invitation_link || `${window.location.origin}/invitation/[id]/[nama-tamu]`;
    
    return `${salutationText} Bapak/Ibu/Saudara/i\n${sampleName}\n\n${greetingText}\n\nLink Undangan:\n${link}?to=${encodeURIComponent(sampleName)}`;
  };

  const handleEditGreeting = () => {
    setIsEditingGreeting(true);
  };

  const handleResetGreeting = () => {
    setIsEditingGreeting(false);
    setCustomGreeting(greetingTemplates[greetingType]);
  };

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
        <title>Dashboard Pelanggan | Inveta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container-custom">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="heading-lg text-foreground">Dashboard Pelanggan</h1>
                <p className="text-muted-foreground mt-2">
                  Selamat datang, {order?.customer_name || user?.email}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            {/* Invitation Link from Admin - Always at Top */}
            {order?.invitation_link && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <LinkIcon className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">Link Undangan Anda</h3>
                    <div className="bg-card rounded-lg p-4 border border-border">
                      <p className="text-sm font-mono break-all text-primary">
                        {order.invitation_link}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - Always Show All Sections */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Salutation */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="heading-sm text-foreground">Pilihan Sapaan</h2>
                  </div>

                  <RadioGroup
                    value={salutation}
                    onValueChange={(value) => setSalutation(value as SalutationType)}
                    className="flex flex-wrap gap-4"
                  >
                    {salutationOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                          salutation === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                        onClick={() => setSalutation(option.value as SalutationType)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer font-medium">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Guest Names */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h2 className="heading-sm text-foreground">Daftar Nama Tamu</h2>
                    </div>
                    {guests.length > 0 && (
                      <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {guests.length} tamu terdaftar
                      </span>
                    )}
                  </div>

                  {/* Existing Guests Table */}
                  {guests.length > 0 && (
                    <div className="mb-6 border border-border rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">No</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {guests.map((guest, index) => (
                            <TableRow key={guest.id}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{guest.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShareWhatsApp(guest)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="Share WhatsApp"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyLink(guest)}
                                    title="Copy Link"
                                  >
                                    <LinkIcon className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyText(guest)}
                                    title="Copy Text"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteGuest(guest.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Add New Guests */}
                  <div>
                    <Label htmlFor="guests">
                      Tambah nama tamu baru (tekan Enter untuk nama baru)
                    </Label>
                    <div className="flex gap-4 mt-2">
                      <Textarea
                        id="guests"
                        placeholder="Budi Santoso&#10;Dewi Lestari&#10;Andi Pratama"
                        value={guestNames}
                        onChange={(e) => setGuestNames(e.target.value)}
                        className="min-h-[120px] font-mono flex-1"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-muted-foreground">
                        {guestNames.split("\n").filter((n) => n.trim()).length} nama baru
                      </p>
                      <Button
                        variant="hero"
                        onClick={handleCreateGuestList}
                        disabled={isCreating || !guestNames.trim()}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {isCreating ? "Menambahkan..." : "Tambah Tamu"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Greeting Type */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="heading-sm text-foreground">Pilihan Ucapan</h2>
                  </div>

                  <RadioGroup
                    value={greetingType}
                    onValueChange={(value) => {
                      setGreetingType(value as GreetingType);
                      setIsEditingGreeting(false);
                    }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  >
                    {greetingOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                          greetingType === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                        onClick={() => {
                          setGreetingType(option.value as GreetingType);
                          setIsEditingGreeting(false);
                        }}
                      >
                        <RadioGroupItem value={option.value} id={`greeting-${option.value}`} />
                        <Label htmlFor={`greeting-${option.value}`} className="cursor-pointer font-medium">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Right - Preview */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 space-y-6">
                  {/* Preview */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        <h2 className="heading-sm text-foreground">Preview Teks</h2>
                      </div>
                      <div className="flex gap-2">
                        {isEditingGreeting ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetGreeting}
                            className="text-xs"
                          >
                            Reset
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditGreeting}
                            className="gap-1 text-xs"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>

                    {isEditingGreeting ? (
                      <Textarea
                        value={customGreeting}
                        onChange={(e) => setCustomGreeting(e.target.value)}
                        className="min-h-[300px] text-sm font-mono"
                        placeholder="Edit teks ucapan..."
                      />
                    ) : (
                      <div className="bg-muted/50 rounded-xl p-4 text-sm whitespace-pre-wrap">
                        {getPreviewText()}
                      </div>
                    )}

                    <p className="mt-4 text-xs text-muted-foreground">
                      * Teks ini akan dikirim ke tamu saat membagikan undangan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CustomerDashboard;
