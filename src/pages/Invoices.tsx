import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Plus, Download, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
  status: string;
  due_date: string;
  created_at: string;
}

export default function Invoices() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Invoice berhasil dihapus',
      });
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus invoice',
        variant: 'destructive',
      });
    }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      draft: { variant: 'outline', label: 'Draft' },
      sent: { variant: 'default', label: 'Terkirim' },
      paid: { variant: 'secondary', label: 'Lunas' },
      overdue: { variant: 'destructive', label: 'Terlambat' },
    };
    const statusInfo = statusMap[status] || statusMap.draft;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <p className="text-center text-muted-foreground">Memuat invoice...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Invoice Manager</h1>
            <p className="text-muted-foreground">Kelola invoice profesional Anda</p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/invoices/new')}>
            <Plus className="h-4 w-4" />
            Buat Invoice
          </Button>
        </div>

        {invoices.length === 0 ? (
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Daftar Invoice</CardTitle>
              <CardDescription>
                Belum ada invoice. Mulai dengan membuat invoice pertama Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-6">Belum ada invoice. Mulai dengan membuat invoice pertama Anda.</p>
              <Button onClick={() => navigate('/invoices/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Invoice Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Daftar Invoice</CardTitle>
              <CardDescription>
                {invoices.length} invoice ditemukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Invoice</TableHead>
                    <TableHead>Klien</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.client_name}</TableCell>
                      <TableCell>{formatIDR(Number(invoice.total))}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/invoices/view/${invoice.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                toast({
                                  title: 'Memproses...',
                                  description: 'Mengunduh invoice sebagai PDF...',
                                });

                                const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
                                  body: { invoiceId: invoice.id }
                                });

                                if (error) throw error;

                                // Use html2pdf to convert HTML to PDF
                                const html2pdf = (await import('html2pdf.js')).default;
                                const element = document.createElement('div');
                                element.innerHTML = data.html;
                                
                                await html2pdf()
                                  .set({
                                    margin: 10,
                                    filename: `Invoice-${invoice.invoice_number}.pdf`,
                                    html2canvas: { scale: 2 },
                                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                                  })
                                  .from(element)
                                  .save();

                                toast({
                                  title: 'Berhasil',
                                  description: 'Invoice berhasil diunduh sebagai PDF',
                                });
                              } catch (error) {
                                console.error('Error downloading invoice:', error);
                                toast({
                                  title: 'Error',
                                  description: 'Gagal mengunduh invoice',
                                  variant: 'destructive',
                                });
                              }
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Yakin ingin menghapus invoice ini?')) {
                                deleteInvoice(invoice.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
