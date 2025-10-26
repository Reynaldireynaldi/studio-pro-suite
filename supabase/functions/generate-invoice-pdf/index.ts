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
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { max-width: 150px; max-height: 80px; }
    .company-info { text-align: right; }
    .invoice-title { font-size: 32px; font-weight: bold; margin-bottom: 20px; }
    .section { margin-bottom: 30px; }
    .section-title { font-weight: bold; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f8f9fa; }
    .total-row { font-weight: bold; background-color: #f8f9fa; }
    .text-right { text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${companyData?.logo_url ? `<img src="${companyData.logo_url}" class="logo" alt="Company Logo">` : ''}
      <div style="margin-top: 10px;">
        <strong>${companyData?.company_name || 'Your Company'}</strong><br>
        ${companyData?.address || ''}<br>
        ${companyData?.email || ''}<br>
        ${companyData?.phone || ''}
      </div>
    </div>
    <div class="company-info">
      <div class="invoice-title">INVOICE</div>
      <div><strong>${invoiceData.invoice_number}</strong></div>
      <div>Tanggal: ${new Date().toLocaleDateString('id-ID')}</div>
      ${invoiceData.due_date ? `<div>Jatuh Tempo: ${new Date(invoiceData.due_date).toLocaleDateString('id-ID')}</div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Tagihan Kepada:</div>
    <div>
      <strong>${invoiceData.bill_to_name || invoiceData.client_name}</strong><br>
      ${invoiceData.bill_to_address || ''}<br>
      ${invoiceData.bill_to_email || invoiceData.email || ''}<br>
      ${invoiceData.bill_to_phone || ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Deskripsi</th>
        <th class="text-right">Jumlah</th>
        <th class="text-right">Harga Satuan</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoiceData.items_json.map((item: any) => `
        <tr>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">Rp ${item.unit_price.toLocaleString('id-ID')}</td>
          <td class="text-right">Rp ${(item.quantity * item.unit_price).toLocaleString('id-ID')}</td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
        <td class="text-right">Rp ${Number(invoiceData.subtotal).toLocaleString('id-ID')}</td>
      </tr>
      ${invoiceData.tax > 0 ? `
      <tr>
        <td colspan="3" class="text-right"><strong>Pajak:</strong></td>
        <td class="text-right">Rp ${Number(invoiceData.tax).toLocaleString('id-ID')}</td>
      </tr>
      ` : ''}
      <tr class="total-row">
        <td colspan="3" class="text-right"><strong>TOTAL:</strong></td>
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
