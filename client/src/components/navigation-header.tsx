import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Cross, 
  Menu, 
  Eye, 
  UserPlus, 
  LogIn, 
  LogOut,
  User,
  Settings,
  Mail,
  AtSign
} from "lucide-react";

export default function NavigationHeader() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  const handleAuth = () => {
    if (user) {
      logoutMutation.mutate();
    } else {
      setLocation("/auth");
    }
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Teachings", path: "/teachings" },
    { label: "Courses", path: "/courses" },
    { label: "Fellowship", path: "/fellowship", requiresAuth: true },
    { label: "Projects", path: "/projects" },
    { label: "About", path: "/about" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleNavigation("/")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              data-testid="button-home"
            >
              <Cross className="text-primary text-xl" />
              <h1 className="text-xl font-semibold text-foreground">Fellowship Hub</h1>
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`transition-colors font-medium ${
                  item.requiresAuth && !user 
                    ? "text-muted-foreground cursor-not-allowed" 
                    : "text-foreground hover:text-primary"
                }`}
                disabled={item.requiresAuth && !user}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Auth Section */}
          <div className="flex items-center space-x-3">
            {!user && (
              <Badge variant="secondary" className="hidden sm:flex items-center">
                <Eye className="mr-1 h-3 w-3" />
                Guest Access
              </Badge>
            )}
            
            {user ? (
              <div className="flex items-center space-x-3">
                {user.isAdmin && (
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation("/admin")}
                    className="text-primary hover:text-primary/80 hidden sm:flex"
                    data-testid="button-admin"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleAuth}
                  className="hidden sm:flex"
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      data-testid="button-account"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Account Information</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 space-y-1">
                      <div className="flex items-center gap-2 py-1.5">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm" data-testid="text-user-name">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.username || 'User'}
                        </span>
                      </div>
                      {user.username && (
                        <div className="flex items-center gap-2 py-1.5">
                          <AtSign className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground break-all" data-testid="text-username">
                            {user.username}
                          </span>
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-center gap-2 py-1.5">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground break-all" data-testid="text-email">
                            {user.email}
                          </span>
                        </div>
                      )}
                    </div>
                    {user.isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5">
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        </div>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={handleAuth}
                  className="text-primary hover:text-primary/80"
                  data-testid="button-sign-in"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button
                  onClick={handleAuth}
                  data-testid="button-join"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join Fellowship
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {user && (
                    <div className="pb-4 border-b border-border">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.username || 'User'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => handleNavigation(item.path)}
                      className={`justify-start ${
                        item.requiresAuth && !user 
                          ? "text-muted-foreground cursor-not-allowed" 
                          : ""
                      }`}
                      disabled={item.requiresAuth && !user}
                    >
                      {item.label}
                    </Button>
                  ))}
                  
                  {user?.isAdmin && (
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation("/admin")}
                      className="justify-start text-primary"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  )}
                  
                  <div className="pt-4 border-t border-border">
                    <Button
                      variant={user ? "outline" : "default"}
                      onClick={handleAuth}
                      className="w-full"
                    >
                      {user ? (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Join Fellowship
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
