import { Link } from "wouter";
import { Home, Package, BarChart3, Ticket, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiredRole?: string[];
}

export function BottomNavigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/",
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: "Orders",
      href: "/orders",
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: "Inventory",
      href: "/inventory",
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: "Reports",
      href: "/reports",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "Support",
      href: "/tickets",
      icon: <Ticket className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 md:hidden">
      <div className="flex items-center justify-between h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg transition-colors",
              isActive(item.href)
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            title={item.label}
          >
            {item.icon}
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/**
 * Mobile-optimized header for SellerDesk
 */
export function MobileHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SD</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">SellerDesk</h1>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="text-right mr-2 hidden sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

/**
 * Main layout wrapper for mobile-first design
 */
export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MobileHeader />
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
