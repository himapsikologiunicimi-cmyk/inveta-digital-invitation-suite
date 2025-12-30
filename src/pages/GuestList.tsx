import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Copy,
  Facebook,
  Instagram,
  Link as LinkIcon,
  MessageCircle,
  Search,
  Share2,
  Trash2,
  FileText,
  Plus,
} from "lucide-react";
import { User, Session } from "@supabase/supabase-js";

interface Guest {
  id: string;
  name: string;
  slug: string;
  shared_via: string[] | null;
  created_at: string;
}

interface Invitation {
  id: string;
  theme_name: string;
  salutation: string;
  greeting_type: string;
}

const greetingTemplates: Record<string, string> = {
  formal: "Dengan hormat, kami mengundang Bapak/Ibu/Saudara/i {nama} untuk menghadiri acara pernikahan kami.",
  muslim: "Assalamualaikum Wr. Wb. Dengan memohon Rahmat dan Ridho Allah SWT, kami mengundang {nama} untuk menghadiri pernikahan kami.",
  nasrani: "Salam sejahtera dalam Kasih Kristus. Dengan penuh sukacita, kami mengundang {nama} untuk menghadiri pemberkatan pernikahan kami.",
  hindu: "Om Swastiastu. Dengan Anugerah Ida Sang Hyang Widhi Wasa, kami mengundang {nama} untuk menghadiri upacara pernikahan kami.",
  ultah: "Hai {nama}! Kamu diundang untuk merayakan hari ulang tahun bersama kami!",
};

const salutationLabels: Record<string, string> = {
  to: "To",
  dear: "Dear",
  kepada: "Kepada",
};

const GuestList = () => {
  const { invitationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const baseUrl = window.location.origin;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user && invitationId) {
      fetchData();
    }
  }, [user, invitationId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch invitation
      const { data: invData, error: invError } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", invitationId)
        .maybeSingle();

      if (invError) throw invError;
      if (!invData) {
        navigate("/dashboard");
        return;
      }

      setInvitation(invData);

      // Fetch guests
      const { data: guestData, error: guestError } = await supabase
        .from("guests")
        .select("*")
        .eq("invitation_id", invitationId)
        .order("created_at", { ascending: true });

      if (guestError) throw guestError;
      setGuests(guestData || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInvitationLink = (slug: string) => {
    return `${baseUrl}/u/${slug}`;
  };

  const getFormattedMessage = (guest: Guest) => {
    if (!invitation) return "";
    
    const salutationText = salutationLabels[invitation.salutation] || "Kepada";
    const template = greetingTemplates[invitation.greeting_type] || greetingTemplates.formal;
    const link = getInvitationLink(guest.slug);
    
    return `${salutationText} ${guest.name},\n\n${template.replace("{nama}", guest.name)}\n\nBuka undangan di:\n${link}`;
  };

  const handleShare = async (guest: Guest, platform: string) => {
    const message = getFormattedMessage(guest);
    const link = getInvitationLink(guest.slug);
    const encodedMessage = encodeURIComponent(message);

    let shareUrl = "";
    
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedMessage}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodedMessage}`;
        break;
      case "instagram":
        // Instagram doesn't support direct sharing, copy to clipboard instead
        await navigator.clipboard.writeText(message);
        toast({
          title: "Teks Disalin",
          description: "Teks undangan telah disalin. Paste di Instagram.",
        });
        return;
      case "link":
        await navigator.clipboard.writeText(link);
        toast({
          title: "Link Disalin",
          description: "Link undangan telah disalin ke clipboard.",
        });
        return;
      case "text":
        await navigator.clipboard.writeText(message);
        toast({
          title: "Teks Disalin",
          description: "Teks undangan telah disalin ke clipboard.",
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }

    // Update shared_via in database
    const currentSharedVia = guest.shared_via || [];
    if (!currentSharedVia.includes(platform)) {
      await supabase
        .from("guests")
        .update({ shared_via: [...currentSharedVia, platform] })
        .eq("id", guest.id);
    }
  };

  const handleDelete = async (guestId: string) => {
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
        description: error.message,
      });
    }
  };

  const filteredGuests = guests.filter((guest) =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <title>Daftar Tamu - {invitation?.theme_name} | Inveta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container-custom">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <Button variant="ghost" size="sm" className="mb-2" asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                  </Link>
                </Button>
                <h1 className="heading-lg text-foreground">Daftar Tamu</h1>
                <p className="text-muted-foreground mt-1">
                  Tema: {invitation?.theme_name} • {guests.length} tamu
                </p>
              </div>
              <Button variant="hero" asChild>
                <Link to="/dashboard">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Tamu
                </Link>
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari nama tamu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Guest Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No</TableHead>
                      <TableHead>Nama Tamu</TableHead>
                      <TableHead className="text-center">Share</TableHead>
                      <TableHead className="w-20 text-center">Hapus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                          {searchQuery
                            ? "Tidak ada tamu yang cocok"
                            : "Belum ada tamu ditambahkan"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGuests.map((guest, index) => (
                        <TableRow key={guest.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{guest.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {getInvitationLink(guest.slug)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[hsl(142_70%_45%)] hover:text-[hsl(142_70%_40%)] hover:bg-[hsl(142_70%_45%)]/10"
                                onClick={() => handleShare(guest, "whatsapp")}
                                title="Share via WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#1877F2] hover:text-[#1877F2] hover:bg-[#1877F2]/10"
                                onClick={() => handleShare(guest, "facebook")}
                                title="Share via Facebook"
                              >
                                <Facebook className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#E4405F] hover:text-[#E4405F] hover:bg-[#E4405F]/10"
                                onClick={() => handleShare(guest, "instagram")}
                                title="Copy for Instagram"
                              >
                                <Instagram className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleShare(guest, "link")}
                                title="Copy Link"
                              >
                                <LinkIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleShare(guest, "text")}
                                title="Copy Text"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Tamu?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Anda yakin ingin menghapus {guest.name} dari daftar tamu?
                                    Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(guest.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Quick Share All */}
            {filteredGuests.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Klik ikon share untuk membagikan undangan ke tamu
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default GuestList;
