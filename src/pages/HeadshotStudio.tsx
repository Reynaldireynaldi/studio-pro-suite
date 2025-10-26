import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Sparkles } from 'lucide-react';

export default function HeadshotStudio() {
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
          <CardContent>
            <div className="border-2 border-dashed rounded-2xl p-12 text-center">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Drag & drop foto Anda di sini
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Pilih Foto
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow rounded-2xl mt-6 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Sparkles className="h-12 w-12 text-primary mb-3" />
            <p className="text-muted-foreground text-center">
              Fitur AI Headshot akan segera tersedia
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
