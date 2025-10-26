import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// HTML escape function to prevent XSS
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Safe error messages
const safeErrors: Record<string, string> = {
  'LOVABLE_API_KEY not configured': 'Konfigurasi layanan belum lengkap',
  'Invoice not found': 'Invoice tidak ditemukan',
  'Company profile not found': 'Profil perusahaan tidak ditemukan',
  'Not authenticated': 'Autentikasi diperlukan',
  'Unauthorized': 'Tidak memiliki akses',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Not authenticated');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const { invoiceId, invoiceData, companyData } = await req.json();

    // If data not provided, fetch from database with ownership validation
    if (!invoiceData || !companyData) {
      // Fetch invoice with ownership check
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('owner_id', user.id)  // Validate ownership
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      // Fetch company profile with ownership check
      const { data: company, error: companyError } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        console.error('Company profile error:', companyError);
      }

      const formatIDR = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
      };

      const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
        .company-header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .logo { max-width: 120px; max-height: 80px; }
        .company-info { text-align: right; }
        .company-info h1 { margin: 0; font-size: 24px; }
        .invoice-details { margin: 30px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .client-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h3 { font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
        .text-right { text-align: right; }
        .total-row { background: #f8f9fa; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="company-header">
          ${company?.logo_url ? `<img src="${escapeHtml(company.logo_url)}" alt="Logo" class="logo" />` : ''}
          <div class="company-info">
            <h1>${escapeHtml(company?.company_name || 'Nama Perusahaan')}</h1>
            <p>${escapeHtml(company?.address || '')}</p>
            <p>${escapeHtml(company?.phone || '')} ${company?.email ? `• ${escapeHtml(company.email)}` : ''}</p>
            ${company?.tax_id ? `<p>NPWP: ${escapeHtml(company.tax_id)}</p>` : ''}
          </div>
        </div>

        <div class="invoice-details">
          <h2>INVOICE</h2>
          <div class="detail-row">
            <span class="label">Nomor Invoice:</span>
            <span class="value">${escapeHtml(invoice.invoice_number)}</span>
          </div>
          <div class="detail-row">
            <span class="label">Tanggal:</span>
            <span class="value">${escapeHtml(new Date(invoice.created_at).toLocaleDateString('id-ID'))}</span>
          </div>
          ${invoice.due_date ? `
            <div class="detail-row">
              <span class="label">Jatuh Tempo:</span>
              <span class="value">${escapeHtml(new Date(invoice.due_date).toLocaleDateString('id-ID'))}</span>
            </div>
          ` : ''}
        </div>

        <div class="client-info">
          <h3>Kepada:</h3>
          <p><strong>${escapeHtml(invoice.client_name)}</strong></p>
          ${invoice.email ? `<p>${escapeHtml(invoice.email)}</p>` : ''}
        </div>

        ${invoice.service_description ? `
        <div class="section">
          <h3>Deskripsi Layanan</h3>
          <p>${escapeHtml(invoice.service_description)}</p>
        </div>
        ` : ''}

        ${invoice.offer_proposal ? `
        <div class="section">
          <h3>Penawaran/Proposal</h3>
          <p>${escapeHtml(invoice.offer_proposal)}</p>
        </div>
        ` : ''}

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Item Pekerjaan</th>
              <th class="text-right">Harga</th>
            </tr>
          </thead>
          <tbody>
          ${invoice.items_json.map((item: any, index: number) => `
            <tr>
              <td>${index + 1}</td>
              <td>
                <strong>${escapeHtml(item.work_item)}</strong>
                ${item.brief_description ? `<br><small>${escapeHtml(item.brief_description)}</small>` : ''}
              </td>
              <td class="text-right">${formatIDR(item.price)}</td>
            </tr>
          `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" class="text-right"><strong>Subtotal:</strong></td>
              <td class="text-right">${formatIDR(invoice.subtotal)}</td>
            </tr>
            ${invoice.tax > 0 ? `
            <tr>
              <td colspan="2" class="text-right"><strong>Pajak:</strong></td>
              <td class="text-right">${formatIDR(invoice.tax)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td colspan="2" class="text-right"><strong>TOTAL:</strong></td>
              <td class="text-right"><strong>${formatIDR(invoice.total)}</strong></td>
            </tr>
          </tfoot>
        </table>

        ${invoice.notes ? `
        <div class="section">
          <h3>Catatan</h3>
          <p>${escapeHtml(invoice.notes)}</p>
        </div>
        ` : ''}

        ${company?.bank_name ? `
        <div class="section">
          <h3>Informasi Pembayaran</h3>
          <p><strong>Bank:</strong> ${escapeHtml(company.bank_name)}</p>
          ${company.bank_account_name ? `<p><strong>Nama Rekening:</strong> ${escapeHtml(company.bank_account_name)}</p>` : ''}
          ${company.bank_account_number ? `<p><strong>Nomor Rekening:</strong> ${escapeHtml(company.bank_account_number)}</p>` : ''}
        </div>
        ` : ''}

        ${invoice.attachments_json && invoice.attachments_json.length > 0 ? `
        <div class="section">
          <h3>Lampiran</h3>
          <ul>
            ${invoice.attachments_json.map((url: string, index: number) => `
              <li>Dokumen ${index + 1}: <a href="${escapeHtml(url)}">Download</a></li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    </body>
    </html>
    `;

      return new Response(JSON.stringify({ html }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Use provided data directly
      const formatIDR = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
      };

      const invoice = invoiceData;
      const company = companyData;

      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          .company-header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo { max-width: 120px; max-height: 80px; }
          .company-info { text-align: right; }
          .company-info h1 { margin: 0; font-size: 24px; }
          .invoice-details { margin: 30px 0; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .client-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section h3 { font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
          th { background: #f8f9fa; font-weight: bold; }
          .text-right { text-align: right; }
          .total-row { background: #f8f9fa; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="company-header">
            ${company?.logo_url ? `<img src="${escapeHtml(company.logo_url)}" alt="Logo" class="logo" />` : ''}
            <div class="company-info">
              <h1>${escapeHtml(company?.company_name || 'Nama Perusahaan')}</h1>
              <p>${escapeHtml(company?.address || '')}</p>
              <p>${escapeHtml(company?.phone || '')} ${company?.email ? `• ${escapeHtml(company.email)}` : ''}</p>
              ${company?.tax_id ? `<p>NPWP: ${escapeHtml(company.tax_id)}</p>` : ''}
            </div>
          </div>

          <div class="invoice-details">
            <h2>INVOICE</h2>
            <div class="detail-row">
              <span class="label">Nomor Invoice:</span>
              <span class="value">${escapeHtml(invoice.invoice_number)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Tanggal:</span>
              <span class="value">${escapeHtml(new Date().toLocaleDateString('id-ID'))}</span>
            </div>
          </div>

          <div class="client-info">
            <h3>Kepada:</h3>
            <p><strong>${escapeHtml(invoice.client_name)}</strong></p>
            ${invoice.email ? `<p>${escapeHtml(invoice.email)}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Item Pekerjaan</th>
                <th class="text-right">Harga</th>
              </tr>
            </thead>
            <tbody>
            ${invoice.items_json.map((item: any, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>
                  <strong>${escapeHtml(item.work_item)}</strong>
                  ${item.brief_description ? `<br><small>${escapeHtml(item.brief_description)}</small>` : ''}
                </td>
                <td class="text-right">${formatIDR(item.price)}</td>
              </tr>
            `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="text-right"><strong>Subtotal:</strong></td>
                <td class="text-right">${formatIDR(invoice.subtotal)}</td>
              </tr>
              ${invoice.tax > 0 ? `
              <tr>
                <td colspan="2" class="text-right"><strong>Pajak:</strong></td>
                <td class="text-right">${formatIDR(invoice.tax)}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td colspan="2" class="text-right"><strong>TOTAL:</strong></td>
                <td class="text-right"><strong>${formatIDR(invoice.total)}</strong></td>
              </tr>
            </tfoot>
          </table>

          ${invoice.notes ? `
          <div class="section">
            <h3>Catatan</h3>
            <p>${escapeHtml(invoice.notes)}</p>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
      `;

      return new Response(JSON.stringify({ html }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-invoice-pdf:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const clientMessage = safeErrors[errorMessage] || 'Terjadi kesalahan saat memproses invoice';
    
    return new Response(JSON.stringify({ 
      error: clientMessage
    }), {
      status: errorMessage === 'Not authenticated' || errorMessage === 'Unauthorized' ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
