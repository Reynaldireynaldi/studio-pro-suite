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
import { Trash2, Plus, Sparkles, Paperclip } from 'lucide-react';

type InvoiceItem = {
  id: string;
  work_item: string;
  price: number;
  brief_description: string;
};

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enhancingField, setEnhancingField] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    invoice_number: `INV-${Date.now()}`,
    client_name: '',
    email: '',
    due_date: '',
    notes: 'Terima kasih atas kepercayaan Anda. Pembayaran dapat dilakukan melalui transfer bank.',
    tax: 0,
    service_description: '',
    offer_proposal: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', work_item: '', price: 0, brief_description: '' }
  ]);

  const [attachments, setAttachments] = useState<File[]>([]);

  const addItem = () => {
    setItems([...items, { 
      id: Date.now().toString(), 
      work_item: '', 
      price: 0,
      brief_description: ''
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      toast({
        title: 'Peringatan',
        description: 'Hanya file PDF yang diperbolehkan',
        variant: 'destructive',
      });
    }
    
    setAttachments([...attachments, ...pdfFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const enhanceWithAI = async (fieldName: string, content: string) => {
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Field tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    setEnhancingField(fieldName);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-cv-field', {
        body: { fieldName, content }
      });

      if (error) throw error;

      setFormData({ ...formData, [fieldName]: data.enhancedText });
      toast({
        title: 'Berhasil',
        description: 'Teks berhasil dipoles dengan AI',
      });
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast({
        title: 'Error',
        description: 'Gagal memoles teks',
        variant: 'destructive',
      });
    } finally {
      setEnhancingField(null);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
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

    if (items.some(item => !item.work_item.trim())) {
      toast({
        title: "Error",
        description: "Semua item pekerjaan harus diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload attachments
      const attachmentUrls: string[] = [];
      for (const file of attachments) {
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cv-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('cv-documents')
          .getPublicUrl(uploadData.path);
        
        attachmentUrls.push(publicUrl);
      }

      const subtotal = calculateSubtotal();
      const total = calculateTotal();

      const { error } = await (supabase as any).from('invoices').insert({
        owner_id: user.id,
        invoice_number: formData.invoice_number,
        client_name: formData.client_name,
        email: formData.email,
        items_json: items,
        subtotal,
        tax: formData.tax,
        total,
        due_date: formData.due_date || null,
        notes: formData.notes,
        status: 'draft',
        service_description: formData.service_description,
        offer_proposal: formData.offer_proposal,
        attachments_json: attachmentUrls,
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
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Deskripsi Layanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="service_description">Deskripsi</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => enhanceWithAI('service_description', formData.service_description)}
                    disabled={enhancingField === 'service_description'}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {enhancingField === 'service_description' ? 'Memproses...' : 'Polish dengan AI'}
                  </Button>
                </div>
                <Textarea
                  id="service_description"
                  value={formData.service_description}
                  onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                  placeholder="Deskripsikan layanan yang Anda tawarkan..."
                  className="rounded-2xl"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Offer/Proposal */}
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Penawaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="offer_proposal">Detail Penawaran</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => enhanceWithAI('offer_proposal', formData.offer_proposal)}
                    disabled={enhancingField === 'offer_proposal'}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {enhancingField === 'offer_proposal' ? 'Memproses...' : 'Polish dengan AI'}
                  </Button>
                </div>
                <Textarea
                  id="offer_proposal"
                  value={formData.offer_proposal}
                  onChange={(e) => setFormData({ ...formData, offer_proposal: e.target.value })}
                  placeholder="Detail penawaran dan proposal..."
                  className="rounded-2xl"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Item Pekerjaan</CardTitle>
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
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Item Pekerjaan *</Label>
                      <Input
                        value={item.work_item}
                        onChange={(e) => updateItem(item.id, 'work_item', e.target.value)}
                        className="rounded-2xl"
                        placeholder="Nama pekerjaan"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Harga (IDR) *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className="rounded-2xl"
                        placeholder="0"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Keterangan Singkat</Label>
                      <Textarea
                        value={item.brief_description}
                        onChange={(e) => updateItem(item.id, 'brief_description', e.target.value)}
                        className="rounded-2xl"
                        placeholder="Deskripsi singkat pekerjaan..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">Total: </span>
                    <span className="font-semibold">{formatIDR(item.price)}</span>
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

          {/* Attachments */}
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Lampiran PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="attachments">Lampiran Dokumen (PDF)</Label>
                <div className="flex gap-2">
                  <Input
                    id="attachments"
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileUpload}
                    className="rounded-2xl"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>File Terlampir:</Label>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-2xl">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Catatan Tambahan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="notes">Catatan</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => enhanceWithAI('notes', formData.notes)}
                    disabled={enhancingField === 'notes'}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {enhancingField === 'notes' ? 'Memproses...' : 'Polish dengan AI'}
                  </Button>
                </div>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan untuk invoice..."
                  className="rounded-2xl"
                  rows={4}
                />
              </div>
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