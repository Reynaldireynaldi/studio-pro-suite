import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Plus } from 'lucide-react';

type InvoiceItem = {
  id: string;
  sku?: string;
  description: string;
  quantity: number;
  unit_price: number;
};

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    invoice_number: `INV-${Date.now()}`,
    client_name: '',
    email: '',
    bill_to_name: '',
    bill_to_address: '',
    bill_to_email: '',
    bill_to_phone: '',
    due_date: '',
    notes: '',
    tax: 0,
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { 
      id: Date.now().toString(), 
      description: '', 
      quantity: 1, 
      unit_price: 0 
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + formData.tax;
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name.trim()) {
      toast({
        title: "Error",
        description: "Nama klien harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (items.some(item => !item.description.trim())) {
      toast({
        title: "Error",
        description: "Semua item harus memiliki deskripsi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const subtotal = calculateSubtotal();
      const total = calculateTotal();

      const { error } = await (supabase
        .from('invoices') as any)
        .insert({
          owner_id: user.id,
          invoice_number: formData.invoice_number,
          client_name: formData.client_name,
          email: formData.email,
          bill_to_name: formData.bill_to_name,
          bill_to_address: formData.bill_to_address,
          bill_to_email: formData.bill_to_email,
          bill_to_phone: formData.bill_to_phone,
          items_json: items,
          subtotal,
          tax: formData.tax,
          total,
          due_date: formData.due_date || null,
          notes: formData.notes,
          status: 'draft',
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Invoice berhasil dibuat",
      });

      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Gagal membuat invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Buat Invoice Baru</h1>
          <p className="text-muted-foreground">Isi detail invoice Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Info */}
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Informasi Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Nomor Invoice *</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="rounded-2xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Tanggal Jatuh Tempo</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Informasi Klien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Nama Klien *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="rounded-2xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold">Tagihan Kepada (Bill To)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bill_to_name">Nama</Label>
                    <Input
                      id="bill_to_name"
                      value={formData.bill_to_name}
                      onChange={(e) => setFormData({ ...formData, bill_to_name: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bill_to_phone">Telepon</Label>
                    <Input
                      id="bill_to_phone"
                      value={formData.bill_to_phone}
                      onChange={(e) => setFormData({ ...formData, bill_to_phone: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bill_to_address">Alamat</Label>
                    <Textarea
                      id="bill_to_address"
                      value={formData.bill_to_address}
                      onChange={(e) => setFormData({ ...formData, bill_to_address: e.target.value })}
                      className="rounded-2xl"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bill_to_email">Email</Label>
                    <Input
                      id="bill_to_email"
                      type="email"
                      value={formData.bill_to_email}
                      onChange={(e) => setFormData({ ...formData, bill_to_email: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Item Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Item {index + 1}</span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Deskripsi *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="rounded-2xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Jumlah *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="rounded-2xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Harga Satuan *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="rounded-2xl"
                        required
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">Total: </span>
                    <span className="font-semibold">{formatIDR(item.quantity * item.unit_price)}</span>
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item
              </Button>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatIDR(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="tax">Pajak (IDR):</Label>
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                    className="rounded-2xl w-32"
                  />
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatIDR(calculateTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Catatan tambahan untuk invoice..."
                className="rounded-2xl"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Invoice'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/invoices')}
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
