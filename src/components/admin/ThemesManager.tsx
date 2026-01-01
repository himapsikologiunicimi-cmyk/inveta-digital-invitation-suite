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
import { Pencil, Trash2, Plus, Palette, ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Theme {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

const ThemesManager = () => {
  const { toast } = useToast();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data tema",
      });
      return;
    }

    setThemes(data || []);
    setIsLoading(false);
  };

  const openCreateDialog = () => {
    setEditingTheme(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormImageUrl("");
    setFormIsActive(true);
    setIsDialogOpen(true);
  };

  const openEditDialog = (theme: Theme) => {
    setEditingTheme(theme);
    setFormName(theme.name);
    setFormDescription(theme.description || "");
    setFormPrice(theme.price.toString());
    setFormImageUrl(theme.image_url || "");
    setFormIsActive(theme.is_active);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formPrice) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nama dan harga wajib diisi",
      });
      return;
    }

    setIsSaving(true);

    const themeData = {
      name: formName.trim(),
      description: formDescription.trim() || null,
      price: parseFloat(formPrice),
      image_url: formImageUrl.trim() || null,
      is_active: formIsActive,
    };

    if (editingTheme) {
      // Update existing theme
      const { error } = await supabase
        .from("themes")
        .update(themeData)
        .eq("id", editingTheme.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal mengupdate tema",
        });
        setIsSaving(false);
        return;
      }

      toast({
        title: "Berhasil!",
        description: "Tema berhasil diupdate",
      });
    } else {
      // Create new theme
      const { error } = await supabase.from("themes").insert(themeData);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal membuat tema baru",
        });
        setIsSaving(false);
        return;
      }

      toast({
        title: "Berhasil!",
        description: "Tema baru berhasil dibuat",
      });
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    fetchThemes();
  };

  const handleDelete = async (themeId: number) => {
    if (!confirm("Yakin ingin menghapus tema ini?")) return;

    const { error } = await supabase.from("themes").delete().eq("id", themeId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus tema",
      });
      return;
    }

    toast({
      title: "Berhasil!",
      description: "Tema berhasil dihapus",
    });

    fetchThemes();
  };

  const toggleActive = async (theme: Theme) => {
    const { error } = await supabase
      .from("themes")
      .update({ is_active: !theme.is_active })
      .eq("id", theme.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengubah status tema",
      });
      return;
    }

    fetchThemes();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
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
          <h2 className="heading-sm text-foreground">Kelola Tema</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tambah, edit, atau hapus tema undangan
          </p>
        </div>
        <Button variant="hero" onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Tema
        </Button>
      </div>

      {themes.length === 0 ? (
        <div className="p-12 text-center">
          <Palette className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Belum ada tema</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gambar</TableHead>
              <TableHead>Nama Tema</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {themes.map((theme) => (
              <TableRow key={theme.id}>
                <TableCell>
                  {theme.image_url ? (
                    <img
                      src={theme.image_url}
                      alt={theme.name}
                      className="w-16 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{theme.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {theme.description || "-"}
                </TableCell>
                <TableCell>{formatPrice(theme.price)}</TableCell>
                <TableCell>
                  <Switch
                    checked={theme.is_active}
                    onCheckedChange={() => toggleActive(theme)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(theme)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(theme.id)}
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
              {editingTheme ? "Edit Tema" : "Tambah Tema Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="themeName">Nama Tema *</Label>
              <Input
                id="themeName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Elegant Rose"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="themeDescription">Deskripsi</Label>
              <Textarea
                id="themeDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Deskripsi singkat tentang tema"
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="themePrice">Harga (IDR) *</Label>
              <Input
                id="themePrice"
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="150000"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="themeImage">URL Gambar</Label>
              <Input
                id="themeImage"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="themeActive">Status Aktif</Label>
              <Switch
                id="themeActive"
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

export default ThemesManager;
