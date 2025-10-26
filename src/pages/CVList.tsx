import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUser, Plus, Download, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CVProfile {
  id: string;
  full_name: string;
  email: string;
  template_type: string;
  created_at: string;
  selected_headshot_url: string;
}

export default function CVList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cvs, setCvs] = useState<CVProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('cv_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCvs(data || []);
    } catch (error) {
      console.error('Error fetching CVs:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat CV',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCV = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('cv_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'CV berhasil dihapus',
      });
      fetchCVs();
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus CV',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <p className="text-center text-muted-foreground">Memuat CV...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Daftar CV</h1>
            <p className="text-muted-foreground">Kelola dan unduh CV Anda</p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/cv/new')}>
            <Plus className="h-4 w-4" />
            Buat CV Baru
          </Button>
        </div>

        {cvs.length === 0 ? (
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Belum Ada CV</CardTitle>
              <CardDescription>
                Mulai dengan membuat CV pertama Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileUser className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-6">Belum ada CV. Buat CV pertama Anda sekarang.</p>
              <Button onClick={() => navigate('/cv/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Buat CV Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Daftar CV</CardTitle>
              <CardDescription>
                {cvs.length} CV ditemukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cvs.map((cv) => (
                    <TableRow key={cv.id}>
                      <TableCell className="font-medium">{cv.full_name}</TableCell>
                      <TableCell>{cv.email}</TableCell>
                      <TableCell className="capitalize">{cv.template_type}</TableCell>
                      <TableCell>
                        {new Date(cv.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/cv/${cv.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: 'Info',
                                description: 'Fitur download PDF akan segera tersedia',
                              });
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Yakin ingin menghapus CV ini?')) {
                                deleteCV(cv.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
