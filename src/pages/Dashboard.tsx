import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { themes, formatPrice } from "@/components/CatalogSection";
import {
  Users,
  FileText,
  MessageSquare,
  Eye,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { User, Session } from "@supabase/supabase-js";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Invitation Form State
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [salutation, setSalutation] = useState<SalutationType>("kepada");
  const [greetingType, setGreetingType] = useState<GreetingType>("formal");
  const [guestNames, setGuestNames] = useState("");
  const [invitationId, setInvitationId] = useState<string | null>(null);

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
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

    setIsLoading(true);

    try {
      // Create invitation first
      const { data: invitation, error: invError } = await supabase
        .from("invitations")
        .insert({
          user_id: user.id,
          theme_id: selectedTheme.id,
          theme_name: selectedTheme.name,
          salutation: salutation,
          greeting_type: greetingType,
        })
        .select()
        .single();

      if (invError) throw invError;

      // Parse guest names (split by newline)
      const names = guestNames
        .split("\n")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      // Create guests
      const guestsToInsert = names.map((name) => ({
        invitation_id: invitation.id,
        user_id: user.id,
        name: name,
        slug: createSlug(name),
      }));

      const { error: guestError } = await supabase
        .from("guests")
        .insert(guestsToInsert);

      if (guestError) throw guestError;

      toast({
        title: "Berhasil!",
        description: `${names.length} tamu berhasil ditambahkan`,
      });

      setInvitationId(invitation.id);
      navigate(`/guest-list/${invitation.id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal membuat daftar tamu",
      });
    } finally {
      setIsLoading(false);
    }
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
        <title>Dashboard - Buat Undangan | Inveta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container-custom">
            <div className="mb-8">
              <h1 className="heading-lg text-foreground">Buat Undangan</h1>
              <p className="text-muted-foreground mt-2">
                Selamat datang, {user?.email}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left - Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Theme Selection */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="heading-sm text-foreground">Pilih Tema</h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                          selectedTheme.id === theme.id
                            ? "border-primary shadow-lg"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <img
                          src={theme.image}
                          alt={theme.name}
                          className="w-full aspect-[3/4] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 text-left">
                          <p className="text-primary-foreground font-semibold text-sm truncate">
                            {theme.name}
                          </p>
                          <p className="text-primary-foreground/80 text-xs">
                            {formatPrice(theme.price)}
                          </p>
                        </div>
                        {selectedTheme.id === theme.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

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
                    disabled={isLoading || !guestNames.trim()}
                  >
                    {isLoading ? (
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
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
