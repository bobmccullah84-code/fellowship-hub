import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Cross, UserPlus, LogIn, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    firstName: "",
    lastName: "",
    rememberMe: false,
    agreeToTerms: false,
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    } else {
      if (!formData.agreeToTerms) {
        alert("Please agree to the Terms of Service and Privacy Policy");
        return;
      }
      registerMutation.mutate({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Cross className="text-primary text-xl" />
              <h1 className="text-xl font-semibold text-foreground">Fellowship Hub</h1>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-card-foreground mb-2">
                  {isLogin ? "Welcome Back" : "Join Our Fellowship"}
                </h2>
                <p className="text-muted-foreground">
                  {isLogin 
                    ? "Sign in to access your fellowship community" 
                    : "Create your account to start your faith journey"
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      data-testid="input-username"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    data-testid="input-password"
                  />
                </div>

                {isLogin ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                      />
                      <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
                    </div>
                    <a href="#" className="text-sm text-primary hover:text-primary/80">
                      Forgot password?
                    </a>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                      required
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:text-primary/80">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:text-primary/80">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                  data-testid={isLogin ? "button-sign-in" : "button-register"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : (
                    <>
                      {isLogin ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                      {isLogin ? "Sign In" : "Create Account"}
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:text-primary/80 font-medium"
                    data-testid="button-toggle-auth-mode"
                  >
                    {isLogin ? "Join Fellowship" : "Sign In"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Hero content */}
        <div className="flex-1 hero-gradient flex items-center justify-center p-8">
          <div className="max-w-lg text-center text-primary-foreground">
            <Cross className="text-accent text-6xl mb-6 mx-auto" />
            <h3 className="text-3xl font-bold mb-4">
              {isLogin ? "Welcome Back to Fellowship" : "Join Our Global Community"}
            </h3>
            <p className="text-lg text-primary-foreground/90 mb-6">
              {isLogin 
                ? "Continue your faith journey with believers from around the world. Access exclusive fellowship features and grow in community."
                : "Connect with thousands of believers worldwide. Share in prayer, study scripture together, and grow in your faith journey."
              }
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center text-accent">
                <UserPlus className="mr-2 h-5 w-5" />
                <span className="font-semibold">2,847+ Active Members</span>
              </div>
              <div className="flex items-center justify-center text-accent">
                <Cross className="mr-2 h-5 w-5" />
                <span className="font-semibold">156 Bible Studies & Teachings</span>
              </div>
              <div className="flex items-center justify-center text-accent">
                <LogIn className="mr-2 h-5 w-5" />
                <span className="font-semibold">42 Countries Represented</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
