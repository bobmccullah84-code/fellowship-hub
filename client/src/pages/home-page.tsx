import NavigationHeader from "@/components/navigation-header";
import HeroSection from "@/components/hero-section";
import DiscipleshipCourse from "@/components/discipleship-course";
import FeaturesGrid from "@/components/features-grid";
import LiveActivity from "@/components/live-activity";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  Cross, 
  Facebook, 
  Twitter, 
  Youtube, 
  Instagram, 
  Mail, 
  Globe, 
  Clock, 
  UserPlus, 
  LogIn,
  MessageCircle,
  Mic,
  Bookmark,
  Heart,
  Utensils,
  Home as HomeIcon,
  Users,
  ArrowRight,
  GraduationCap
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleJoinFellowship = () => {
    if (user) {
      setLocation("/fellowship");
    } else {
      setLocation("/auth");
    }
  };

  const handleSignIn = () => {
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <HeroSection />
      <DiscipleshipCourse />
      <FeaturesGrid />
      <LiveActivity />
      
      {/* Community Help Projects Preview Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Making a Difference Together
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Join our community outreach initiatives and help those in need through hands-on service, donations, and prayer support.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <Card className="card-hover shadow-sm hover:shadow-lg transition-all duration-200" data-testid="card-preview-feeding">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Utensils className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Feeding Programs</h3>
                <p className="text-muted-foreground mb-4">
                  Help provide meals to families in need and support local food banks.
                </p>
                <div className="flex items-center text-sm text-accent">
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Active Projects Available</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover shadow-sm hover:shadow-lg transition-all duration-200" data-testid="card-preview-homeless">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <HomeIcon className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Homeless Outreach</h3>
                <p className="text-muted-foreground mb-4">
                  Serve those without shelter through care packages and support services.
                </p>
                <div className="flex items-center text-sm text-accent">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Volunteers Needed</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover shadow-sm hover:shadow-lg transition-all duration-200" data-testid="card-preview-children">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Children's Support</h3>
                <p className="text-muted-foreground mb-4">
                  Provide school supplies, coats, and essentials for children in our community.
                </p>
                <div className="flex items-center text-sm text-accent">
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Donations Welcome</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => setLocation("/projects")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg"
              data-testid="button-view-all-projects"
            >
              View All Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-16 hero-gradient text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Join Our Fellowship?
            </h2>
            <p className="text-lg lg:text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Connect with believers worldwide, participate in discussions, and grow in your faith journey together. Registration is free and opens up a world of fellowship opportunities.
            </p>
            
            {/* Benefits of Registration */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <MessageCircle className="text-accent text-2xl mb-3 mx-auto" />
                <div className="font-semibold mb-1">Join Discussions</div>
                <div className="text-sm text-primary-foreground/80">Participate in community chats</div>
              </div>
              <div className="text-center">
                <Mic className="text-accent text-2xl mb-3 mx-auto" />
                <div className="font-semibold mb-1">Voice Fellowship</div>
                <div className="text-sm text-primary-foreground/80">Speak in voice channels</div>
              </div>
              <div className="text-center">
                <Bookmark className="text-accent text-2xl mb-3 mx-auto" />
                <div className="font-semibold mb-1">Save Progress</div>
                <div className="text-sm text-primary-foreground/80">Track course completion</div>
              </div>
              <div className="text-center">
                <Heart className="text-accent text-2xl mb-3 mx-auto" />
                <div className="font-semibold mb-1">Prayer Support</div>
                <div className="text-sm text-primary-foreground/80">Share and receive prayers</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleJoinFellowship}
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-4 text-lg"
                data-testid="button-join-fellowship"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                {user ? "Go to Fellowship" : "Create Free Account"}
              </Button>
              {!user && (
                <Button 
                  variant="outline"
                  onClick={handleSignIn}
                  className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 text-lg"
                  data-testid="button-sign-in"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              )}
            </div>
            
            {!user && (
              <p className="text-sm text-primary-foreground/70">
                Already have an account? <button onClick={handleSignIn} className="text-accent hover:text-accent/80 font-medium">Sign in here</button>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Cross className="text-primary text-xl" />
                <h3 className="text-lg font-semibold text-card-foreground">Fellowship Hub</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Building a global community of believers through online fellowship, teaching, and discipleship.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-card-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
                <li><a href="/teachings" className="text-muted-foreground hover:text-primary transition-colors">Teachings</a></li>
                <li><a href="#courses" className="text-muted-foreground hover:text-primary transition-colors">Courses</a></li>
                <li><a href="/fellowship" className="text-muted-foreground hover:text-primary transition-colors">Fellowship</a></li>
                <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-semibold text-card-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Prayer Requests</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Bible Study</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Devotionals</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Christian Living</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-semibold text-card-foreground mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-muted-foreground flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  hello@fellowshiphub.com
                </li>
                <li className="text-muted-foreground flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  Global Online Community
                </li>
                <li className="text-muted-foreground flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  24/7 Fellowship Available
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-muted-foreground text-sm">
                © 2024 Fellowship Hub. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
