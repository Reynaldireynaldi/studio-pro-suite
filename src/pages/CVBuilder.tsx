import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUser, Upload, Plus } from 'lucide-react';

export default function CVBuilder() {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <div className="space-y-6 mb-8">
          <h1 className="text-3xl font-bold">CV Builder</h1>
          <p className="text-muted-foreground">Buat CV profesional dengan bantuan AI</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <FileUser className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Buat CV Baru</CardTitle>
              <CardDescription>
                Mulai dari awal dengan form terstruktur dan bantuan AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
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
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow rounded-2xl mt-6 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileUser className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Fitur CV Builder akan segera tersedia
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
