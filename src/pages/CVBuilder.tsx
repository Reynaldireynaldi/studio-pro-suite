import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUser, Upload, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function CVBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadPDF = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Error',
          description: 'Hanya file PDF yang diperbolehkan',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Info',
        description: 'Fitur import PDF akan segera tersedia dengan AI parsing',
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <div className="space-y-6 mb-8">
          <h1 className="text-3xl font-bold">CV Builder</h1>
          <p className="text-muted-foreground">Buat CV profesional dengan bantuan AI</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <FileUser className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Lihat Daftar CV</CardTitle>
              <CardDescription>
                Kelola dan download CV yang sudah dibuat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => navigate('/cv/list')}>
                <FileUser className="h-4 w-4 mr-2" />
                Lihat Daftar CV
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow rounded-2xl">
            <CardHeader>
              <FileUser className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Buat CV Baru</CardTitle>
              <CardDescription>
                Mulai dari awal dengan form terstruktur dan bantuan AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/cv/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Buat CV Baru
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow rounded-2xl">
            <CardHeader>
              <Upload className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Import dari PDF</CardTitle>
              <CardDescription>
                Upload CV existing dan parse otomatis dengan AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button variant="outline" className="w-full" onClick={handleUploadPDF}>
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
