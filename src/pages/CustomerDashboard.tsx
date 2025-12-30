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
  Instagram,
  Facebook,
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

type SalutationType = "to" | "kepada" | "dear";
type GreetingType = "formal" | "muslim" | "nasrani" | "hindu" | "ultah";

const salutationOptions = [
  { value: "to", label: "Yth." },
  { value: "kepada", label: "Kepada Yth." },
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
  formal: `Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i [Nama Tamu] untuk menghadiri acara pernikahan kami.

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.

[Nama Pengantin]

Link Undangan:
[Link Undangan]`,
  muslim: `Assalamualaikum Warahmatullahi Wabarakatuh

Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i [Nama Tamu] untuk menghadiri acara pernikahan kami.

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Wassalamualaikum Warahmatullahi Wabarakatuh

[Nama Pengantin]

Link Undangan:
[Link Undangan]`,
  nasrani: `Salam sejahtera dalam Kasih Kristus

Dengan penuh sukacita dan ucapan syukur kepada Tuhan Yang Maha Esa, kami bermaksud mengundang Bapak/Ibu/Saudara/i [Nama Tamu] untuk menghadiri pemberkatan pernikahan kami.

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Tuhan Memberkati

[Nama Pengantin]

Link Undangan:
[Link Undangan]`,
  hindu: `Om Swastiastu

Dengan Anugerah Ida Sang Hyang Widhi Wasa, kami bermaksud mengundang Bapak/Ibu/Saudara/i [Nama Tamu] untuk menghadiri upacara pernikahan kami.

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Om Shanti Shanti Shanti Om

[Nama Pengantin]

Link Undangan:
[Link Undangan]`,
  ultah: `Halo!

Dengan penuh sukacita, kami mengundang [Nama Tamu] untuk hadir merayakan hari ulang tahun bersama kami.

Kehadiran dan doa akan menjadi hadiah terindah untuk kami.

Sampai jumpa di hari bahagia!

[Nama Pengantin]

Link Undangan:
[Link Undangan]`,
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
  custom_message?: string;
}

interface Order {
  id: string;
  invitation_link: string;
  customer_name: string;
  couple_names: string;
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [salutation, setSalutation] = useState<SalutationType>("to");
  const [greetingType, setGreetingType] = useState<GreetingType>("formal");
  const [guestNames, setGuestNames] = useState("");
  const [customGreeting, setCustomGreeting] = useState("");

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
    setCustomGreeting(greetingTemplates[greetingType]);
  }, [greetingType]);

  const fetchData = async (userId: string) => {
    // Fetch order (invitation link from admin)
    const { data: orderData } = await supabase
      .from("orders")
      .select("id, invitation_link, customer_name, couple_names")
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
      setSalutation((invData.salutation as SalutationType) || "to");
      setGreetingType((invData.greeting_type as GreetingType) || "formal");
      if (invData.custom_message) {
        setCustomGreeting(invData.custom_message);
      }
      
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
            custom_message: customGreeting,
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
            custom_message: customGreeting,
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
    if (order?.invitation_link) {
      return `${order.invitation_link}?to=${encodeURIComponent(guest.name)}`;
    }
    const baseUrl = window.location.origin;
    return `${baseUrl}/invitation/${invitation?.id}/${guest.slug}`;
  };

  const getShareText = (guest: Guest) => {
    const salutationText = salutationOptions.find(s => s.value === salutation)?.label || "Yth.";
    const link = getInvitationLink(guest);
    const coupleNames = order?.couple_names || "[Nama Pengantin]";
    
    // Replace placeholders in custom greeting
    let text = customGreeting
      .replace(/\[Nama Tamu\]/g, guest.name)
      .replace(/\[Link Undangan\]/g, link)
      .replace(/\[Nama Pengantin\]/g, coupleNames);
    
    return `${salutationText} Bapak/Ibu/Saudara/i\n${guest.name}\n\n${text}`;
  };

  const handleShareWhatsApp = (guest: Guest) => {
    const text = encodeURIComponent(getShareText(guest));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleShareInstagram = (guest: Guest) => {
    // Instagram doesn't have direct share API, copy to clipboard and open IG
    navigator.clipboard.writeText(getShareText(guest));
    toast({
      title: "Teks disalin!",
      description: "Buka Instagram dan paste teks undangan",
    });
    window.open("https://instagram.com", "_blank");
  };

  const handleShareFacebook = (guest: Guest) => {
    const link = getInvitationLink(guest);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, "_blank");
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
    const sampleName = guestNames.split("\n")[0]?.trim() || "[Nama Tamu]";
    const salutationText = salutationOptions.find(s => s.value === salutation)?.label || "Yth.";
    const link = order?.invitation_link || "[Link Undangan]";
    const coupleNames = order?.couple_names || "[Nama Pengantin]";
    
    // Replace placeholders
    let text = customGreeting
      .replace(/\[Nama Tamu\]/g, sampleName)
      .replace(/\[Link Undangan\]/g, link)
      .replace(/\[Nama Pengantin\]/g, coupleNames);
    
    return `${salutationText} Bapak/Ibu/Saudara/i\n${sampleName}\n\n${text}`;
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

            {/* Main Content */}
            <div className="max-w-4xl mx-auto space-y-8">
              {/* 1. Pilihan Sapaan */}
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

              {/* 2. Nama Tamu */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="heading-sm text-foreground">Nama Tamu</h2>
                </div>

                <div>
                  <Label htmlFor="guests">
                    Masukkan nama tamu (tekan Enter untuk nama baru)
                  </Label>
                  <Textarea
                    id="guests"
                    placeholder="Budi Santoso&#10;Dewi Lestari&#10;Andi Pratama"
                    value={guestNames}
                    onChange={(e) => setGuestNames(e.target.value)}
                    className="min-h-[120px] font-mono mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {guestNames.split("\n").filter((n) => n.trim()).length} nama tamu
                  </p>
                </div>
              </div>

              {/* 3. Pilihan Ucapan */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h2 className="heading-sm text-foreground">Pilihan Ucapan</h2>
                </div>

                <RadioGroup
                  value={greetingType}
                  onValueChange={(value) => setGreetingType(value as GreetingType)}
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
                      onClick={() => setGreetingType(option.value as GreetingType)}
                    >
                      <RadioGroupItem value={option.value} id={`greeting-${option.value}`} />
                      <Label htmlFor={`greeting-${option.value}`} className="cursor-pointer font-medium">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* 4. Preview Teks - Editable directly */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-primary" />
                  <h2 className="heading-sm text-foreground">Preview Teks</h2>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Edit langsung teks undangan di bawah ini. Gunakan placeholder: [Nama Tamu], [Link Undangan], [Nama Pengantin]
                </p>

                <Textarea
                  value={customGreeting}
                  onChange={(e) => setCustomGreeting(e.target.value)}
                  className="min-h-[250px] text-sm font-mono mb-4"
                  placeholder="Edit teks ucapan..."
                />

                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">Contoh hasil:</p>
                  <div className="text-sm whitespace-pre-wrap">
                    {getPreviewText()}
                  </div>
                </div>
              </div>

              {/* 5. Tombol Buat Daftar Undangan */}
              <div className="flex justify-center">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleCreateGuestList}
                  disabled={isCreating || !guestNames.trim()}
                  className="gap-2 px-8"
                >
                  <Plus className="w-5 h-5" />
                  {isCreating ? "Menambahkan..." : "Buat Daftar Undangan"}
                </Button>
              </div>

              {/* 6. Daftar Tamu - Muncul setelah klik tombol */}
              {guests.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h2 className="heading-sm text-foreground">Daftar Undangan Tamu</h2>
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {guests.length} tamu
                    </span>
                  </div>

                  <div className="border border-border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">No</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead className="text-right">Bagikan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {guests.map((guest, index) => (
                          <TableRow key={guest.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{guest.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                {/* WhatsApp */}
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
                                {/* Instagram */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShareInstagram(guest)}
                                  className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                                  title="Share Instagram"
                                >
                                  <Instagram className="w-4 h-4" />
                                </Button>
                                {/* Facebook */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShareFacebook(guest)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Share Facebook"
                                >
                                  <Facebook className="w-4 h-4" />
                                </Button>
                                {/* Copy Link */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyLink(guest)}
                                  title="Copy Link"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                </Button>
                                {/* Copy Text */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyText(guest)}
                                  title="Copy Text"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                                {/* Delete */}
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
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CustomerDashboard;
