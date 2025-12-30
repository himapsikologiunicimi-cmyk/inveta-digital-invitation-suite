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
  Share2,
  Link as LinkIcon,
  FileText,
  LogOut,
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

type SalutationType = "to" | "dear" | "kepada";
type GreetingType = "formal" | "muslim" | "nasrani" | "hindu" | "ultah";

const salutationOptions = [
  { value: "to", label: "To" },
  { value: "dear", label: "Dear" },
  { value: "kepada", label: "Kepada" },
];

const greetingOptions = [
  { value: "formal", label: "Formal" },
  { value: "muslim", label: "Muslim" },
  { value: "nasrani", label: "Nasrani" },
  { value: "hindu", label: "Hindu" },
  { value: "ultah", label: "Ulang Tahun" },
];

const greetingTemplates: Record<GreetingType, string> = {
  formal: "Dengan hormat, kami mengundang Bapak/Ibu/Saudara/i {nama} untuk menghadiri acara pernikahan kami.",
  muslim: "Assalamualaikum Wr. Wb. Dengan memohon Rahmat dan Ridho Allah SWT, kami mengundang {nama} untuk menghadiri pernikahan kami.",
  nasrani: "Salam sejahtera dalam Kasih Kristus. Dengan penuh sukacita, kami mengundang {nama} untuk menghadiri pemberkatan pernikahan kami.",
  hindu: "Om Swastiastu. Dengan Anugerah Ida Sang Hyang Widhi Wasa, kami mengundang {nama} untuk menghadiri upacara pernikahan kami.",
  ultah: "Hai {nama}! Kamu diundang untuk merayakan hari ulang tahun bersama kami!",
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

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [salutation, setSalutation] = useState<SalutationType>("kepada");
  const [greetingType, setGreetingType] = useState<GreetingType>("formal");
  const [guestNames, setGuestNames] = useState("");

  // Guest List State
  const [guests, setGuests] = useState<Guest[]>([]);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [showGuestList, setShowGuestList] = useState(false);

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
        // Check if user already has an invitation
        fetchExistingInvitation(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchExistingInvitation = async (userId: string) => {
    const { data: invData, error: invError } = await supabase
      .from("invitations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (invData && !invError) {
      setInvitation(invData as Invitation);
      setSalutation(invData.salutation as SalutationType);
      setGreetingType(invData.greeting_type as GreetingType);
      
      // Fetch guests
      const { data: guestsData } = await supabase
        .from("guests")
        .select("*")
        .eq("invitation_id", invData.id)
        .order("created_at", { ascending: true });

      if (guestsData) {
        setGuests(guestsData);
        setShowGuestList(true);
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
      setShowGuestList(true);
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
    const baseUrl = window.location.origin;
    return `${baseUrl}/invitation/${invitation?.id}/${guest.slug}`;
  };

  const getShareText = (guest: Guest) => {
    const salutationText = salutationOptions.find(s => s.value === salutation)?.label || "Kepada";
    const template = greetingTemplates[greetingType];
    const link = getInvitationLink(guest);
    return `${salutationText} ${guest.name},\n\n${template.replace("{nama}", guest.name)}\n\nLink Undangan: ${link}`;
  };

  const handleShareWhatsApp = (guest: Guest) => {
    const text = encodeURIComponent(getShareText(guest));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleShareFacebook = (guest: Guest) => {
    const link = encodeURIComponent(getInvitationLink(guest));
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}`, "_blank");
  };

  const handleShareInstagram = (guest: Guest) => {
    // Instagram doesn't have direct share URL, copy text to clipboard
    navigator.clipboard.writeText(getShareText(guest));
    toast({
      title: "Disalin!",
      description: "Teks undangan disalin. Paste di Instagram Stories/DM.",
    });
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
    const template = greetingTemplates[greetingType];
    const sampleName = guestNames.split("\n")[0]?.trim() || "Nama Tamu";
    const salutationText = salutationOptions.find(s => s.value === salutation)?.label || "Kepada";
    return `${salutationText} ${sampleName},\n\n${template.replace("{nama}", sampleName)}`;
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
        <title>Buat Undangan | Inveta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container-custom">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="heading-lg text-foreground">
                  {showGuestList ? "Daftar Tamu" : "Buat Undangan"}
                </h1>
                <p className="text-muted-foreground mt-2">
                  Selamat datang, {user?.email}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            {/* Guest List View */}
            {showGuestList && guests.length > 0 ? (
              <div className="space-y-6">
                {/* Add More Guests */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-5 h-5 text-primary" />
                    <h2 className="heading-sm text-foreground">Tambah Tamu Baru</h2>
                  </div>
                  <div className="flex gap-4">
                    <Textarea
                      placeholder="Masukkan nama tamu baru (tekan Enter untuk nama baru)"
                      value={guestNames}
                      onChange={(e) => setGuestNames(e.target.value)}
                      className="min-h-[100px] font-mono flex-1"
                    />
                    <Button
                      variant="hero"
                      onClick={handleCreateGuestList}
                      disabled={isCreating || !guestNames.trim()}
                      className="shrink-0"
                    >
                      {isCreating ? "Menambahkan..." : "Tambah"}
                    </Button>
                  </div>
                </div>

                {/* Guest Table */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h2 className="heading-sm text-foreground">
                      Daftar Tamu ({guests.length})
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">No</TableHead>
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
                              <div className="flex items-center justify-end gap-2 flex-wrap">
                                {/* WhatsApp */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShareWhatsApp(guest)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Share via WhatsApp"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                </Button>
                                {/* Facebook */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShareFacebook(guest)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Share via Facebook"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                  </svg>
                                </Button>
                                {/* Instagram */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShareInstagram(guest)}
                                  className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                                  title="Copy for Instagram"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
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
              </div>
            ) : (
              /* Create Invitation Form */
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
                    <div className="flex items-center gap-2 mb-6">
                      <Users className="w-5 h-5 text-primary" />
                      <h2 className="heading-sm text-foreground">Daftar Nama Tamu</h2>
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
                        className="mt-2 min-h-[200px] font-mono"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {guestNames.split("\n").filter((n) => n.trim()).length} nama tamu
                      </p>
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
                </div>

                {/* Right - Preview & Submit */}
                <div className="lg:col-span-1">
                  <div className="sticky top-28 space-y-6">
                    {/* Preview */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Eye className="w-5 h-5 text-primary" />
                        <h2 className="heading-sm text-foreground">Preview Teks</h2>
                      </div>

                      <div className="bg-muted/50 rounded-xl p-4 text-sm whitespace-pre-wrap">
                        {getPreviewText()}
                      </div>
                    </div>

                    {/* Submit */}
                    <Button
                      variant="hero"
                      size="xl"
                      className="w-full gap-2"
                      onClick={handleCreateGuestList}
                      disabled={isCreating || !guestNames.trim()}
                    >
                      {isCreating ? (
                        "Memproses..."
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Buat Daftar Nama Tamu
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Setelah membuat daftar, Anda bisa membagikan undangan ke tamu
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CustomerDashboard;