import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Sparkles, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HeadshotStudio() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [style, setStyle] = useState('formal');
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Pilih foto terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGeneratedImages([]);
    
    // Show progress toast
    const progressToast = toast({
      title: "Memproses AI Headshot...",
      description: (
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Upload foto... 30%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: '30%' }} />
          </div>
        </div>
      ),
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('headshots')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('headshots')
        .getPublicUrl(uploadData.path);

      // Convert to base64 for AI processing
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        const base64Image = reader.result as string;

        // Update progress
        toast({
          title: "Memproses AI Headshot...",
          description: (
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mengirim ke AI... 70%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: '70%' }} />
              </div>
            </div>
          ),
        });

        // Process with AI
        const { data, error } = await supabase.functions.invoke('process-headshot', {
          body: { imageUrl: base64Image, style }
        });

        if (error) throw error;

        if (data?.imageUrl) {
          // Update progress to 100%
          toast({
            title: "Memproses AI Headshot...",
            description: (
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Selesai! 100%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                </div>
              </div>
            ),
          });

          setGeneratedImages([data.imageUrl]);
          
          // Save to database
          const { error: dbError } = await (supabase as any).from('headshots').insert({
            owner_id: user.id,
            source_file_url: publicUrl,
            variants_json: [data.imageUrl],
            style,
            status: 'completed'
          });
          
          if (dbError) {
            console.error('Database error:', dbError);
          }

          toast({
            title: "Berhasil",
            description: "Headshot profesional berhasil dibuat!",
          });
        }
      };

    } catch (error: any) {
      console.error('Error generating headshot:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memproses foto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-3">
            <Camera className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Headshot Studio</h1>
              <p className="text-muted-foreground">Transform foto biasa menjadi headshot profesional dengan AI</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                <CardTitle className="text-lg">Upload Foto</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload foto Anda dan crop ke ukuran 1:1
              </p>
            </CardContent>
          </Card>

          <Card className="shadow rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">2</span>
                </div>
                <CardTitle className="text-lg">Pilih Gaya</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Formal Kantor, Smart Casual, atau Corporate
              </p>
            </CardContent>
          </Card>

          <Card className="shadow rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">3</span>
                </div>
                <CardTitle className="text-lg">AI Generate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dapatkan 3-6 varian headshot profesional
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Upload Foto Anda</CardTitle>
            <CardDescription>
              Format: JPG, PNG. Maksimal 5MB. Pastikan wajah terlihat jelas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!previewUrl ? (
              <div 
                className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Klik untuk memilih foto atau drag & drop di sini
                </p>
                <Button type="button">
                  <Upload className="h-4 w-4 mr-2" />
                  Pilih Foto
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full max-w-sm mx-auto">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full rounded-2xl shadow-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Pilih Gaya</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal Kantor (Jas & Kemeja)</SelectItem>
                      <SelectItem value="smart-casual">Smart Casual</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Headshot
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                      setGeneratedImages([]);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {generatedImages.length > 0 && (
          <Card className="shadow rounded-2xl mt-6">
            <CardHeader>
              <CardTitle>Hasil Headshot Profesional</CardTitle>
              <CardDescription>
                Headshot Anda telah diproses dengan AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {generatedImages.map((imgUrl, index) => (
                  <div key={index} className="space-y-3">
                    <img 
                      src={imgUrl} 
                      alt={`Generated ${index + 1}`}
                      className="w-full rounded-2xl shadow-lg"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={async () => {
                        try {
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) throw new Error("Not authenticated");

                          // Update or create CV profile with selected headshot
                          const { data: existingProfile } = await (supabase as any)
                            .from('cv_profiles')
                            .select('id')
                            .eq('owner_id', user.id)
                            .maybeSingle();

                          if (existingProfile) {
                            await (supabase as any)
                              .from('cv_profiles')
                              .update({ selected_headshot_url: imgUrl })
                              .eq('id', existingProfile.id);
                          }

                          toast({
                            title: "Berhasil",
                            description: "Headshot dipilih untuk CV Anda",
                          });
                        } catch (error) {
                          console.error('Error selecting headshot:', error);
                          toast({
                            title: "Error",
                            description: "Gagal memilih headshot",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Pilih & Gunakan di CV
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
