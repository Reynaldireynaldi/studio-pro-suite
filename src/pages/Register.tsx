import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileUser } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || !confirmPassword) {
      toast.error('Semua field harus diisi');
      setLoading(false);
      return;
    }

    // Strengthen password requirements
    if (password.length < 10) {
      toast.error('Password minimal 10 karakter');
      setLoading(false);
      return;
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast.error('Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus (@$!%*?&)');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password);

    if (error) {
      if (error.message?.includes('already registered')) {
        toast.error('Email sudah terdaftar. Silakan login.');
      } else {
        toast.error(error.message || 'Pendaftaran gagal.');
      }
    } else {
      toast.success('Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi.');
      navigate('/login');
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
          <CardTitle className="text-2xl">Daftar OneApp Pro</CardTitle>
          <CardDescription>
            Buat akun baru untuk mulai menggunakan layanan kami
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
                <p className="text-xs text-muted-foreground">Minimal 10 karakter dengan huruf besar, huruf kecil, angka, dan karakter khusus</p>
              </div>
              <div className="space-8">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-2xl"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Masuk di sini
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
