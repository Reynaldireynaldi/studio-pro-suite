import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2, Camera } from 'lucide-react';
import { z } from 'zod';

// Validation schema
const cvProfileSchema = z.object({
  full_name: z.string().trim().min(1, 'Nama lengkap harus diisi').max(200, 'Nama lengkap maksimal 200 karakter'),
  email: z.string().trim().email('Format email tidak valid').max(255, 'Email maksimal 255 karakter'),
  phone: z.string().trim().max(50, 'Nomor telepon maksimal 50 karakter').optional().or(z.literal('')),
  location: z.string().trim().max(200, 'Lokasi maksimal 200 karakter').optional().or(z.literal('')),
  summary: z.string().max(2000, 'Ringkasan maksimal 2000 karakter').optional().or(z.literal('')),
});

const experienceSchema = z.object({
  company: z.string().trim().min(1, 'Nama perusahaan harus diisi').max(200, 'Nama perusahaan maksimal 200 karakter'),
  job_title: z.string().trim().min(1, 'Posisi harus diisi').max(200, 'Posisi maksimal 200 karakter'),
  description_bullets: z.array(z.string().max(1000, 'Deskripsi maksimal 1000 karakter')),
});

const projectSchema = z.object({
  project_name: z.string().trim().min(1, 'Nama proyek harus diisi').max(200, 'Nama proyek maksimal 200 karakter'),
  description_bullets: z.array(z.string().max(1000, 'Deskripsi maksimal 1000 karakter')),
});

interface Experience {
  id: string;
  company: string;
  job_title: string;
  start_date: string;
  end_date: string;
  description_bullets: string[];
}

interface Project {
  id: string;
  project_name: string;
  technologies: string[];
  description_bullets: string[];
}

export default function CVForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [headshotUrl, setHeadshotUrl] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [techInput, setTechInput] = useState<Record<string, string>>({});
  const [enhancing, setEnhancing] = useState<string | null>(null);

  useEffect(() => {
    // Load headshot if available
    const loadHeadshot = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await (supabase as any)
          .from('cv_profiles')
          .select('selected_headshot_url')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (data?.selected_headshot_url) {
          setHeadshotUrl(data.selected_headshot_url);
        }
      } catch (error) {
        console.error('Error loading headshot:', error);
      }
    };

    // Load CV data if editing existing CV
    const loadCVData = async () => {
      const pathParts = window.location.pathname.split('/');
      const cvId = pathParts[pathParts.length - 1];
      
      // Check if we're editing (URL has a UUID)
      if (cvId && cvId !== 'new' && cvId.includes('-')) {
        try {
          const { data: cvProfile, error: cvError } = await (supabase as any)
            .from('cv_profiles')
            .select('*')
            .eq('id', cvId)
            .single();

          if (cvError) throw cvError;

          if (cvProfile) {
            setFormData({
              full_name: cvProfile.full_name || '',
              email: cvProfile.email || '',
              phone: cvProfile.phone || '',
              location: cvProfile.location || '',
              summary: cvProfile.summary || '',
              skills: cvProfile.skills_json || [],
            });

            if (cvProfile.selected_headshot_url) {
              setHeadshotUrl(cvProfile.selected_headshot_url);
            }

            // Load experiences
            const { data: exps } = await (supabase as any)
              .from('cv_experiences')
              .select('*')
              .eq('cv_profile_id', cvId);

            if (exps && exps.length > 0) {
              setExperiences(exps.map((exp: any) => ({
                id: exp.id,
                company: exp.company,
                job_title: exp.job_title,
                start_date: exp.start_date || '',
                end_date: exp.end_date || '',
                description_bullets: exp.description_bullets_json || [''],
              })));
            }

            // Load projects
            const { data: projs } = await (supabase as any)
              .from('cv_projects')
              .select('*')
              .eq('cv_profile_id', cvId);

            if (projs && projs.length > 0) {
              setProjects(projs.map((proj: any) => ({
                id: proj.id,
                project_name: proj.project_name,
                technologies: proj.technologies_json || [],
                description_bullets: proj.description_bullets_json || [''],
              })));
            }
          }
        } catch (error) {
          console.error('Error loading CV data:', error);
          toast({
            title: 'Error',
            description: 'Gagal memuat data CV',
            variant: 'destructive',
          });
        }
      }
    };

    loadHeadshot();
    loadCVData();

    // Load parsed data if coming from PDF import
    const parsedData = location.state?.parsedData;
    if (parsedData) {
      setFormData({
        full_name: parsedData.full_name || '',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        location: parsedData.location || '',
        summary: parsedData.summary || '',
        skills: parsedData.skills || [],
      });
      
      if (parsedData.experiences) {
        setExperiences(parsedData.experiences.map((exp: any) => ({
          ...exp,
          id: crypto.randomUUID(),
        })));
      }
      
      if (parsedData.projects) {
        setProjects(parsedData.projects.map((proj: any) => ({
          ...proj,
          id: crypto.randomUUID(),
        })));
      }
    }
  }, [location.state, toast]);

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, {
      id: crypto.randomUUID(),
      company: '',
      job_title: '',
      start_date: '',
      end_date: '',
      description_bullets: ['']
    }]);
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setExperiences(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  const addProject = () => {
    setProjects(prev => [...prev, {
      id: crypto.randomUUID(),
      project_name: '',
      technologies: [],
      description_bullets: ['']
    }]);
  };

  const updateProject = (id: string, field: string, value: any) => {
    setProjects(prev => prev.map(proj =>
      proj.id === id ? { ...proj, [field]: value } : proj
    ));
  };

  const removeProject = (id: string) => {
    setProjects(prev => prev.filter(proj => proj.id !== id));
  };

  const addTechnology = (projectId: string) => {
    const tech = techInput[projectId]?.trim();
    if (tech) {
      setProjects(prev => prev.map(proj =>
        proj.id === projectId
          ? { ...proj, technologies: [...proj.technologies, tech] }
          : proj
      ));
      setTechInput(prev => ({ ...prev, [projectId]: '' }));
    }
  };

  const removeTechnology = (projectId: string, index: number) => {
    setProjects(prev => prev.map(proj =>
      proj.id === projectId
        ? { ...proj, technologies: proj.technologies.filter((_, i) => i !== index) }
        : proj
    ));
  };

  const enhanceWithAI = async (fieldName: string, content: string, setter: (value: string) => void) => {
    setEnhancing(fieldName);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-cv-field', {
        body: { fieldName, content }
      });

      if (error) throw error;

      if (data?.enhancedText) {
        setter(data.enhancedText);
        toast({
          title: 'Berhasil',
          description: 'Teks berhasil dipoles dengan AI',
        });
      }
    } catch (error) {
      console.error('Error enhancing with AI:', error);
      toast({
        title: 'Error',
        description: 'Gagal memoles dengan AI',
        variant: 'destructive',
      });
    } finally {
      setEnhancing(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate profile data
    try {
      cvProfileSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Error Validasi',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    // Validate experiences
    for (const exp of experiences) {
      try {
        experienceSchema.parse(exp);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({
            title: 'Error Validasi Pengalaman',
            description: error.errors[0].message,
            variant: 'destructive',
          });
          return;
        }
      }
    }

    // Validate projects
    for (const proj of projects) {
      try {
        projectSchema.parse(proj);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({
            title: 'Error Validasi Proyek',
            description: error.errors[0].message,
            variant: 'destructive',
          });
          return;
        }
      }
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create CV profile
      const { data: profile, error: profileError } = await (supabase as any)
        .from('cv_profiles')
        .insert({
          owner_id: user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          summary: formData.summary,
          skills_json: formData.skills,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create experiences
      if (experiences.length > 0) {
        const experiencesData = experiences.map(exp => ({
          owner_id: user.id,
          cv_profile_id: profile.id,
          company: exp.company,
          job_title: exp.job_title,
          start_date: exp.start_date,
          end_date: exp.end_date,
          description_bullets_json: exp.description_bullets,
        }));

        const { error: expError } = await (supabase as any)
          .from('cv_experiences')
          .insert(experiencesData);

        if (expError) throw expError;
      }

      // Create projects
      if (projects.length > 0) {
        const projectsData = projects.map(proj => ({
          owner_id: user.id,
          cv_profile_id: profile.id,
          project_name: proj.project_name,
          technologies_json: proj.technologies,
          description_bullets_json: proj.description_bullets,
        }));

        const { error: projError } = await (supabase as any)
          .from('cv_projects')
          .insert(projectsData);

        if (projError) throw projError;
      }

      toast({
        title: 'Berhasil',
        description: 'CV berhasil disimpan',
      });

      navigate('/cv');
    } catch (error) {
      console.error('Error saving CV:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan CV',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/cv')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Headshot Preview */}
              <div className="space-y-2">
                <Label>Foto Profil (Headshot)</Label>
                {headshotUrl ? (
                  <div className="flex items-center gap-4">
                    <img 
                      src={headshotUrl} 
                      alt="Headshot" 
                      className="w-24 h-24 rounded-full object-cover border-2"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Headshot telah dipilih
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/headshot-studio')}
                        className="mt-2"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Ganti Headshot
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-2xl p-6 text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Belum ada headshot dipilih
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/headshot-studio')}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Pilih Headshot
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                <Label>Nama Lengkap *</Label>
                <Input
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Telepon</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Lokasi</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Ringkasan Profesional</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!formData.summary || enhancing === 'summary'}
                    onClick={() => enhanceWithAI('summary', formData.summary, (text) => 
                      setFormData(prev => ({ ...prev, summary: text }))
                    )}
                  >
                    {enhancing === 'summary' ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 mr-1" />
                    )}
                    Polish dengan AI
                  </Button>
                </div>
                <Textarea
                  rows={4}
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Ceritakan tentang pengalaman dan keahlian Anda..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keahlian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Tambah keahlian"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                    <span className="text-sm">{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pengalaman Kerja</CardTitle>
              <Button type="button" variant="outline" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Pengalaman #{experiences.indexOf(exp) + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(exp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Perusahaan</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Posisi</Label>
                      <Input
                        value={exp.job_title}
                        onChange={(e) => updateExperience(exp.id, 'job_title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Tanggal Mulai</Label>
                      <Input
                        type="date"
                        value={exp.start_date}
                        onChange={(e) => updateExperience(exp.id, 'start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Tanggal Selesai</Label>
                      <Input
                        type="date"
                        value={exp.end_date}
                        onChange={(e) => updateExperience(exp.id, 'end_date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Deskripsi</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!exp.description_bullets[0] || enhancing === `exp-${exp.id}`}
                        onClick={() => enhanceWithAI('description', exp.description_bullets[0], (text) =>
                          updateExperience(exp.id, 'description_bullets', [text])
                        )}
                      >
                        {enhancing === `exp-${exp.id}` ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3 mr-1" />
                        )}
                        Polish dengan AI
                      </Button>
                    </div>
                    <Textarea
                      rows={3}
                      value={exp.description_bullets[0]}
                      onChange={(e) => updateExperience(exp.id, 'description_bullets', [e.target.value])}
                      placeholder="Jelaskan tanggung jawab dan pencapaian Anda..."
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pengalaman Projek</CardTitle>
              <Button type="button" variant="outline" onClick={addProject}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {projects.map((proj) => (
                <div key={proj.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Projek #{projects.indexOf(proj) + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProject(proj.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label>Nama Projek</Label>
                    <Input
                      value={proj.project_name}
                      onChange={(e) => updateProject(proj.id, 'project_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Teknologi</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Tambah teknologi"
                        value={techInput[proj.id] || ''}
                        onChange={(e) => setTechInput(prev => ({ ...prev, [proj.id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology(proj.id))}
                      />
                      <Button type="button" onClick={() => addTechnology(proj.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {proj.technologies.map((tech, index) => (
                        <div key={index} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                          <span className="text-sm">{tech}</span>
                          <button
                            type="button"
                            onClick={() => removeTechnology(proj.id, index)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Deskripsi</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!proj.description_bullets[0] || enhancing === `proj-${proj.id}`}
                        onClick={() => enhanceWithAI('description', proj.description_bullets[0], (text) =>
                          updateProject(proj.id, 'description_bullets', [text])
                        )}
                      >
                        {enhancing === `proj-${proj.id}` ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3 mr-1" />
                        )}
                        Polish dengan AI
                      </Button>
                    </div>
                    <Textarea
                      rows={3}
                      value={proj.description_bullets[0]}
                      onChange={(e) => updateProject(proj.id, 'description_bullets', [e.target.value])}
                      placeholder="Jelaskan projek dan outcome nya..."
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/cv')}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan CV'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
