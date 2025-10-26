import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safe error messages
const safeErrors: Record<string, string> = {
  'LOVABLE_API_KEY not configured': 'Konfigurasi layanan belum lengkap',
  'Not authenticated': 'Autentikasi diperlukan',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `You are a CV parser. Extract all information from the following CV/resume text and return it as JSON.

IMPORTANT: Look for these fields in the CV text:
- full_name: Look for the person's name (usually at the top)
- email: Email address
- phone: Phone/mobile number
- location: City, state, or address
- summary: Professional summary or objective statement
- skills: Array of technical skills, soft skills, or competencies
- experiences: Array of work experiences with:
  * company: Company name
  * job_title: Position/title
  * start_date: Start date in YYYY-MM format
  * end_date: End date in YYYY-MM format (use "Present" if current)
  * description_bullets: Array of responsibilities/achievements
- projects: Array of projects with:
  * project_name: Project name
  * technologies: Array of technologies used
  * description_bullets: Array of project details

CV Text:
${pdfText}

Return ONLY a valid JSON object with all extracted fields. If a field is not found, use null for strings, empty array [] for arrays.

Example format:
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "location": "New York, NY",
  "summary": "Experienced software engineer...",
  "skills": ["JavaScript", "Python", "React"],
  "experiences": [
    {
      "company": "Tech Corp",
      "job_title": "Software Engineer",
      "start_date": "2020-01",
      "end_date": "Present",
      "description_bullets": ["Developed features", "Led team"]
    }
  ],
  "projects": [
    {
      "project_name": "E-commerce Platform",
      "technologies": ["React", "Node.js"],
      "description_bullets": ["Built shopping cart", "Integrated payment"]
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a CV parsing assistant. Extract structured data from CV text and return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Strip markdown code blocks if present
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const parsedData = JSON.parse(content);

    return new Response(JSON.stringify({ parsedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in parse-cv-pdf:', error);
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
