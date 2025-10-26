import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceData, companyData } = await req.json();

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    .header { margin-bottom: 40px; }
    .logo { max-width: 150px; max-height: 80px; margin-bottom: 20px; }
    .company-info { margin-bottom: 20px; }
    .invoice-title { font-size: 32px; font-weight: bold; margin: 20px 0; }
    .client-info { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
    .section { margin-bottom: 30px; }
    .section-title { font-weight: bold; margin-bottom: 10px; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f8f9fa; font-weight: bold; }
    .total-row { font-weight: bold; background-color: #f8f9fa; }
    .text-right { text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    ${companyData?.logo_url ? `<img src="${companyData.logo_url}" class="logo" alt="Company Logo">` : ''}
    <div class="company-info">
      <strong style="font-size: 20px;">${companyData?.company_name || 'Your Company'}</strong><br>
      ${companyData?.address || ''}<br>
      ${companyData?.email || ''}<br>
      ${companyData?.phone || ''}
    </div>
    <div class="invoice-title">INVOICE</div>
    <div><strong>No: ${invoiceData.invoice_number}</strong></div>
    <div>Tanggal: ${new Date().toLocaleDateString('id-ID')}</div>
    ${invoiceData.due_date ? `<div>Jatuh Tempo: ${new Date(invoiceData.due_date).toLocaleDateString('id-ID')}</div>` : ''}
  </div>

  <div class="client-info">
    <div class="section-title">Kepada:</div>
    <div>
      <strong>${invoiceData.client_name}</strong><br>
      ${invoiceData.email || ''}
    </div>
  </div>

  ${invoiceData.service_description ? `
  <div class="section">
    <div class="section-title">Deskripsi Layanan:</div>
    <div>${invoiceData.service_description}</div>
  </div>
  ` : ''}

  ${invoiceData.offer_proposal ? `
  <div class="section">
    <div class="section-title">Penawaran:</div>
    <div>${invoiceData.offer_proposal}</div>
  </div>
  ` : ''}

  <table>
    <thead>
      <tr>
        <th>Item Pekerjaan</th>
        <th class="text-right">Harga (IDR)</th>
        <th>Keterangan</th>
      </tr>
    </thead>
    <tbody>
      ${invoiceData.items_json.map((item: any) => `
        <tr>
          <td>${item.work_item || item.description}</td>
          <td class="text-right">Rp ${(item.price || (item.quantity * item.unit_price)).toLocaleString('id-ID')}</td>
          <td>${item.brief_description || ''}</td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" class="text-right"><strong>Subtotal:</strong></td>
        <td class="text-right">Rp ${Number(invoiceData.subtotal).toLocaleString('id-ID')}</td>
      </tr>
      ${invoiceData.tax > 0 ? `
      <tr>
        <td colspan="2" class="text-right"><strong>Pajak:</strong></td>
        <td class="text-right">Rp ${Number(invoiceData.tax).toLocaleString('id-ID')}</td>
      </tr>
      ` : ''}
      <tr class="total-row">
        <td colspan="2" class="text-right"><strong>TOTAL:</strong></td>
        <td class="text-right"><strong>Rp ${Number(invoiceData.total).toLocaleString('id-ID')}</strong></td>
      </tr>
    </tfoot>
  </table>

  ${invoiceData.notes ? `
  <div class="section" style="margin-top: 30px;">
    <div class="section-title">Catatan:</div>
    <div>${invoiceData.notes}</div>
  </div>
  ` : ''}

  ${companyData?.bank_name ? `
  <div class="section" style="margin-top: 40px;">
    <div class="section-title">Informasi Pembayaran:</div>
    <div>
      Bank: ${companyData.bank_name}<br>
      Nama Rekening: ${companyData.bank_account_name || ''}<br>
      Nomor Rekening: ${companyData.bank_account_number || ''}
    </div>
  </div>
  ` : ''}

  ${invoiceData.attachments_json && invoiceData.attachments_json.length > 0 ? `
  <div class="section" style="margin-top: 40px;">
    <div class="section-title">Lampiran:</div>
    <ul>
      ${invoiceData.attachments_json.map((url: string, idx: number) => `
        <li>Dokumen ${idx + 1}: <a href="${url}">${url}</a></li>
      `).join('')}
    </ul>
  </div>
  ` : ''}
</body>
</html>
`;

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-invoice-pdf:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
