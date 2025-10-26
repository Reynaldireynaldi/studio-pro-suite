import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2 } from 'lucide-react';

export default function CompanySettings() {
  return (
    <Layout>
      <div className="container-app py-8 space-32 max-w-4xl mx-auto">
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
            <form className="space-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-8 md:col-span-2">
                  <Label htmlFor="company_name">Nama Perusahaan *</Label>
                  <Input id="company_name" placeholder="PT. Nama Perusahaan" className="rounded-2xl" />
                </div>

                <div className="space-8 md:col-span-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea 
                    id="address" 
                    placeholder="Jl. Nama Jalan No. 123, Kota, Provinsi" 
                    className="rounded-2xl"
                    rows={3}
                  />
                </div>

                <div className="space-8">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input id="phone" placeholder="+62 812-3456-7890" className="rounded-2xl" />
                </div>

                <div className="space-8">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="info@perusahaan.com" className="rounded-2xl" />
                </div>

                <div className="space-8">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="www.perusahaan.com" className="rounded-2xl" />
                </div>

                <div className="space-8">
                  <Label htmlFor="tax_id">NPWP</Label>
                  <Input id="tax_id" placeholder="00.000.000.0-000.000" className="rounded-2xl" />
                </div>
              </div>

              <div className="border-t pt-6 space-16">
                <h3 className="text-lg font-semibold">Informasi Bank</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-8">
                    <Label htmlFor="bank_name">Nama Bank</Label>
                    <Input id="bank_name" placeholder="Bank ABC" className="rounded-2xl" />
                  </div>

                  <div className="space-8">
                    <Label htmlFor="bank_account_name">Nama Rekening</Label>
                    <Input id="bank_account_name" placeholder="PT. Nama Perusahaan" className="rounded-2xl" />
                  </div>

                  <div className="space-8 md:col-span-2">
                    <Label htmlFor="bank_account_number">Nomor Rekening</Label>
                    <Input id="bank_account_number" placeholder="1234567890" className="rounded-2xl" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-16">
                <h3 className="text-lg font-semibold">Syarat Pembayaran</h3>
                <div className="space-8">
                  <Label htmlFor="payment_terms">Ketentuan Pembayaran Default</Label>
                  <Textarea 
                    id="payment_terms" 
                    placeholder="Pembayaran jatuh tempo 14 hari setelah tanggal invoice..."
                    className="rounded-2xl"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  Simpan Perubahan
                </Button>
                <Button type="button" variant="outline" className="flex-1">
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
                <div className="space-8">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <h3 className="font-bold text-lg">Nama Perusahaan</h3>
                  <p className="text-sm text-muted-foreground">Alamat perusahaan</p>
                  <p className="text-sm text-muted-foreground">Telepon • Email</p>
                  <p className="text-sm text-muted-foreground">NPWP: 00.000.000.0-000.000</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
