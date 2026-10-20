import NavigationHeader from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Target, 
  BookOpen, 
  Mail, 
  MessageCircle, 
  Heart, 
  Video,
  Users,
  Phone,
  MapPin,
  Cross,
  ArrowRight
} from "lucide-react";

export default function AboutPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Cross className="text-primary h-12 w-12" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            About Fellowship Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A Christian community platform dedicated to spiritual growth, biblical teaching, and fellowship among believers worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Purpose Card */}
          <Card className="card-hover shadow-md hover:shadow-lg transition-all duration-200" data-testid="card-purpose">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Our Purpose</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Fellowship Hub exists to create a vibrant online Christian community where believers can grow in their faith, study God's Word, and connect with fellow Christians around the world.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">We aim to:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Provide quality biblical teachings and resources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Foster meaningful connections among believers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Support spiritual growth through discipleship</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Encourage community service and outreach</span>
                  </li>
                </ul>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation("/projects")}
                data-testid="button-view-projects"
              >
                <Heart className="mr-2 h-4 w-4" />
                View Our Projects
              </Button>
            </CardContent>
          </Card>

          {/* Beliefs Card */}
          <Card className="card-hover shadow-md hover:shadow-lg transition-all duration-200" data-testid="card-beliefs">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">What We Believe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We are rooted in historic Christian faith and hold to core biblical principles that unite believers across denominations.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Core Beliefs:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <Cross className="text-accent mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span>The Bible as God's inspired Word</span>
                  </li>
                  <li className="flex items-start">
                    <Cross className="text-accent mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span>Salvation through faith in Jesus Christ</span>
                  </li>
                  <li className="flex items-start">
                    <Cross className="text-accent mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span>The Trinity: Father, Son, and Holy Spirit</span>
                  </li>
                  <li className="flex items-start">
                    <Cross className="text-accent mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span>The Church as the body of Christ</span>
                  </li>
                  <li className="flex items-start">
                    <Cross className="text-accent mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span>Christ's return and eternal life</span>
                  </li>
                </ul>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation("/teachings")}
                data-testid="button-view-teachings"
              >
                <Video className="mr-2 h-4 w-4" />
                Explore Teachings
              </Button>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="card-hover shadow-md hover:shadow-lg transition-all duration-200 md:col-span-2 lg:col-span-1" data-testid="card-contact">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Mail className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We'd love to hear from you! Connect with us or explore different areas of our community.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-accent shrink-0" />
                  <a 
                    href="mailto:contact@fellowshiphub.com" 
                    className="text-primary hover:underline"
                    data-testid="link-email"
                  >
                    contact@fellowshiphub.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-accent shrink-0" />
                  <a 
                    href="tel:+1-555-FELLOWSHIP" 
                    className="text-primary hover:underline"
                    data-testid="link-phone"
                  >
                    +1 (555) FELLOWSHIP
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-muted-foreground">Online Community</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <h4 className="font-semibold text-foreground text-sm mb-3">Explore Our Community:</h4>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/courses")}
                  data-testid="button-courses"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Discipleship Courses</span>
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/fellowship")}
                  data-testid="button-fellowship"
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Join Fellowship</span>
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/projects")}
                  data-testid="button-community-projects"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Community Projects</span>
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/teachings")}
                  data-testid="button-teachings-sermons"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  <span>Teachings & Sermons</span>
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Ready to Join Our Community?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Experience the fellowship, grow in your faith, and connect with believers around the world. Registration is free!
            </p>
            <Button 
              size="lg"
              onClick={() => setLocation("/auth")}
              data-testid="button-join-now"
            >
              <Users className="mr-2 h-5 w-5" />
              Join Fellowship Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
