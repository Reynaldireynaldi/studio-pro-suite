import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Plus } from 'lucide-react';

export default function Invoices() {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Invoice Manager</h1>
            <p className="text-muted-foreground">Kelola invoice profesional Anda</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Invoice
          </Button>
        </div>

        <Card className="shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Daftar Invoice</CardTitle>
            <CardDescription>
              Belum ada invoice. Mulai dengan membuat invoice pertama Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">Fitur invoice akan segera tersedia</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Invoice Pertama
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
