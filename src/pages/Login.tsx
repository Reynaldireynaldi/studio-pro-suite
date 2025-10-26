import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileUser } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || 'Login gagal. Periksa email dan password Anda.');
    } else {
      toast.success('Login berhasil!');
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader className="text-center space-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <FileUser className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Masuk ke OneApp Pro</CardTitle>
          <CardDescription>
            Kelola CV, headshot, dan invoice Anda dalam satu aplikasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-24">
            <div className="space-16">
              <div className="space-8">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-2xl"
                />
              </div>
              <div className="space-8">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-2xl"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Daftar di sini
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
