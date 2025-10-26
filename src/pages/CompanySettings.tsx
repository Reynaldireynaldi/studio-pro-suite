import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Upload, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formatNPWP = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Format: 00.000.000.0-000.000
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 9) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9, 12)}.${digits.slice(12, 15)}`;
};

export default function CompanySettings() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    company_name: '',
    logo_url: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    tax_id: '',
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    payment_terms: '',
  });

  useEffect(() => {
    loadCompanyProfile();
  }, []);

  const loadCompanyProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from('company_profiles')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setFormData({
          company_name: data.company_name || '',
          logo_url: data.logo_url || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          tax_id: data.tax_id || '',
          bank_name: data.bank_name || '',
          bank_account_name: data.bank_account_name || '',
          bank_account_number: data.bank_account_number || '',
          payment_terms: data.payment_terms_default || '',
        });
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 2MB",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData({ ...formData, logo_url: '' });
  };

  const handleNPWPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNPWP(e.target.value);
    setFormData({ ...formData, tax_id: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.company_name.trim()) {
      toast({
        title: "Error",
        description: "Nama perusahaan harus diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let logoUrl = formData.logo_url;

      // Upload logo if new file selected
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.id}/logo.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(uploadData.path);

        logoUrl = publicUrl;
      }

      // Check if profile exists
      const { data: existing } = await (supabase as any)
        .from('company_profiles')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (existing) {
        // Update
        const { error } = await (supabase as any)
          .from('company_profiles')
          .update({
            company_name: formData.company_name,
            logo_url: logoUrl,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            website: formData.website,
            tax_id: formData.tax_id,
            bank_name: formData.bank_name,
            bank_account_name: formData.bank_account_name,
            bank_account_number: formData.bank_account_number,
            payment_terms_default: formData.payment_terms,
          })
          .eq('owner_id', user.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await (supabase as any)
          .from('company_profiles')
          .insert({
            owner_id: user.id,
            company_name: formData.company_name,
            logo_url: logoUrl,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            website: formData.website,
            tax_id: formData.tax_id,
            bank_name: formData.bank_name,
            bank_account_name: formData.bank_account_name,
            bank_account_number: formData.bank_account_number,
            payment_terms_default: formData.payment_terms,
          });

        if (error) throw error;
      }

      toast({
        title: "Berhasil",
        description: "Profil perusahaan berhasil disimpan",
      });

      // Reload data
      await loadCompanyProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan profil perusahaan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        <div className="space-16">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Profil Perusahaan</h1>
              <p className="text-muted-foreground">Kelola informasi perusahaan untuk invoice</p>
            </div>
          </div>
        </div>

        <Card className="shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Informasi Perusahaan</CardTitle>
            <CardDescription>
              Data ini akan ditampilkan di header invoice Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-4">
                <Label>Logo Perusahaan</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                
                {logoPreview ? (
                  <div className="relative w-32 h-32 border-2 border-dashed rounded-2xl p-2">
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="w-32 h-32 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Upload Logo</p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Format: JPG, PNG, SVG. Maksimal 2MB
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company_name">Nama Perusahaan *</Label>
                  <Input 
                    id="company_name" 
                    placeholder="PT. Nama Perusahaan" 
                    className="rounded-2xl"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea 
                    id="address" 
                    placeholder="Jl. Nama Jalan No. 123, Kota, Provinsi" 
                    className="rounded-2xl"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input 
                    id="phone" 
                    placeholder="+62 812-3456-7890" 
                    className="rounded-2xl"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="info@perusahaan.com" 
                    className="rounded-2xl"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    placeholder="www.perusahaan.com" 
                    className="rounded-2xl"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id">NPWP</Label>
                  <Input 
                    id="tax_id" 
                    placeholder="00.000.000.0-000.000" 
                    className="rounded-2xl"
                    value={formData.tax_id}
                    onChange={handleNPWPChange}
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold">Informasi Bank</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Nama Bank</Label>
                    <Input 
                      id="bank_name" 
                      placeholder="Bank ABC" 
                      className="rounded-2xl"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_account_name">Nama Rekening</Label>
                    <Input 
                      id="bank_account_name" 
                      placeholder="PT. Nama Perusahaan" 
                      className="rounded-2xl"
                      value={formData.bank_account_name}
                      onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bank_account_number">Nomor Rekening</Label>
                    <Input 
                      id="bank_account_number" 
                      placeholder="1234567890" 
                      className="rounded-2xl"
                      value={formData.bank_account_number}
                      onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold">Syarat Pembayaran</h3>
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Ketentuan Pembayaran Default</Label>
                  <Textarea 
                    id="payment_terms" 
                    placeholder="Pembayaran jatuh tempo 14 hari setelah tanggal invoice..."
                    className="rounded-2xl"
                    rows={3}
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    loadCompanyProfile();
                    setLogoFile(null);
                  }}
                  disabled={loading}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow rounded-2xl bg-muted/50">
          <CardHeader>
            <CardTitle>Preview Header Invoice</CardTitle>
            <CardDescription>Tampilan header di invoice publik Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-card p-6 rounded-2xl border">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Company Logo" 
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <h3 className="font-bold text-lg">{formData.company_name || 'Nama Perusahaan'}</h3>
                  <p className="text-sm text-muted-foreground">{formData.address || 'Alamat perusahaan'}</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.phone && formData.email 
                      ? `${formData.phone} • ${formData.email}`
                      : formData.phone || formData.email || 'Telepon • Email'}
                  </p>
                  {formData.tax_id && (
                    <p className="text-sm text-muted-foreground">NPWP: {formData.tax_id}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
