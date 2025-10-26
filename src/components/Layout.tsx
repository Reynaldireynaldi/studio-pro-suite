import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FileUser, Receipt, Camera, Settings, LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/headshot', label: 'Headshot', icon: Camera },
    { path: '/cv', label: 'CV Builder', icon: FileUser },
    { path: '/invoices', label: 'Invoice', icon: Receipt },
    { path: '/settings/company', label: 'Settings', icon: Settings },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);
        return (
          <Link key={item.path} to={item.path}>
            <Button 
              variant={isActive ? "default" : "ghost"} 
              className="w-full justify-start gap-3"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
      <Button 
        variant="ghost" 
        onClick={signOut}
        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" />
        Keluar
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container-app flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold text-primary">OneApp Pro</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-60 border-r bg-card p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary mb-2">OneApp Pro</h1>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
          <nav className="flex-1 space-y-2">
            <NavLinks />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-60 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
