import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safe error messages
const safeErrors: Record<string, string> = {
  'CV not found': 'CV tidak ditemukan',
  'Not authenticated': 'Autentikasi diperlukan',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvId } = await req.json();

    // Here you would fetch CV data from database and generate PDF
    // For now, return a simple HTML template
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Curriculum Vitae</h1>
  </div>
  
  <div class="section">
    <div class="section-title">Personal Information</div>
    <p>This is a placeholder CV. Full implementation coming soon.</p>
  </div>
</body>
</html>
`;

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-cv-pdf:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const clientMessage = safeErrors[errorMessage] || 'Terjadi kesalahan saat memproses CV';
    
    return new Response(JSON.stringify({ 
      error: clientMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
