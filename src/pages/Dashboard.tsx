import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Camera, FileUser, Receipt, Settings } from 'lucide-react';

export default function Dashboard() {
  const features = [
    {
      icon: Camera,
      title: 'Headshot Studio',
      description: 'Buat foto profil profesional dengan AI',
      link: '/headshot',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: FileUser,
      title: 'CV Builder',
      description: 'Buat CV profesional dengan mudah',
      link: '/cv',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Receipt,
      title: 'Invoice Manager',
      description: 'Kelola invoice dan tagihan Anda',
      link: '/invoices',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Settings,
      title: 'Company Profile',
      description: 'Atur profil perusahaan Anda',
      link: '/settings/company',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <Layout>
      <div className="container-app py-8 space-32">
        <div className="space-16">
          <h1 className="text-3xl font-bold">Selamat Datang di OneApp Pro</h1>
          <p className="text-muted-foreground">
            Platform lengkap untuk freelancer dan profesional. Kelola CV, headshot, dan invoice dalam satu tempat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.link} className="shadow rounded-2xl hover:shadow-lg transition-smooth">
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={feature.link}>
                    <Button className="w-full">Mulai</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
