import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  email: string;
  bill_to_name: string;
  bill_to_address: string;
  bill_to_email: string;
  bill_to_phone: string;
  items_json: any[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  due_date: string;
  notes: string;
  created_at: string;
}

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
    fetchCompanyData();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setInvoice(data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await (supabase as any)
        .from('company_profiles')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      setCompanyData(data);
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setInvoice((prev) => prev ? { ...prev, status: newStatus } : null);
      toast({
        title: 'Berhasil',
        description: 'Status invoice berhasil diubah',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengubah status',
        variant: 'destructive',
      });
    }
  };

  const downloadPDF = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoiceData: invoice, companyData }
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice?.invoice_number}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Berhasil',
        description: 'Invoice berhasil diunduh',
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengunduh invoice',
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
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
          <p className="text-center text-muted-foreground">Memuat invoice...</p>
        </div>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
          <p className="text-center text-muted-foreground">Invoice tidak ditemukan</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/invoices')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{invoice.invoice_number}</h1>
            {getStatusBadge(invoice.status)}
          </div>
          <div className="flex gap-2">
            <Select value={invoice.status} onValueChange={updateStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Terkirim</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="overdue">Terlambat</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={downloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card className="shadow rounded-2xl mb-6">
          <CardHeader>
            <CardTitle>Detail Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Dari:</h3>
                <p className="text-sm">
                  {companyData?.company_name || 'Your Company'}<br />
                  {companyData?.address}<br />
                  {companyData?.email}<br />
                  {companyData?.phone}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Kepada:</h3>
                <p className="text-sm">
                  {invoice.bill_to_name || invoice.client_name}<br />
                  {invoice.bill_to_address}<br />
                  {invoice.bill_to_email || invoice.email}<br />
                  {invoice.bill_to_phone}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tanggal:</span>
                <span className="ml-2">{new Date(invoice.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              {invoice.due_date && (
                <div>
                  <span className="text-muted-foreground">Jatuh Tempo:</span>
                  <span className="ml-2">{new Date(invoice.due_date).toLocaleDateString('id-ID')}</span>
                </div>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Deskripsi</th>
                    <th className="text-right p-3">Jumlah</th>
                    <th className="text-right p-3">Harga</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items_json.map((item: any, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.description}</td>
                      <td className="text-right p-3">{item.quantity}</td>
                      <td className="text-right p-3">{formatIDR(item.unit_price)}</td>
                      <td className="text-right p-3">{formatIDR(item.quantity * item.unit_price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-muted/50">
                  <tr>
                    <td colSpan={3} className="text-right p-3 font-semibold">Subtotal:</td>
                    <td className="text-right p-3">{formatIDR(Number(invoice.subtotal))}</td>
                  </tr>
                  {invoice.tax > 0 && (
                    <tr>
                      <td colSpan={3} className="text-right p-3 font-semibold">Pajak:</td>
                      <td className="text-right p-3">{formatIDR(Number(invoice.tax))}</td>
                    </tr>
                  )}
                  <tr className="font-bold">
                    <td colSpan={3} className="text-right p-3">TOTAL:</td>
                    <td className="text-right p-3">{formatIDR(Number(invoice.total))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {invoice.notes && (
              <div>
                <h3 className="font-semibold mb-2">Catatan:</h3>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
