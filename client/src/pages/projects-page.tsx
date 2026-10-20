import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Heart, 
  Users, 
  Calendar,
  MapPin,
  Mail,
  User,
  Filter,
  Utensils,
  Home,
  GraduationCap,
  Car,
  Wrench
} from "lucide-react";
import type { Project } from "@shared/schema";

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const categories = [
    { id: "all", label: "All Projects", icon: Heart },
    { id: "feeding", label: "Feeding Program", icon: Utensils },
    { id: "homeless", label: "Homeless Outreach", icon: Home },
    { id: "children", label: "Children's Support", icon: GraduationCap },
    { id: "automotive", label: "Automotive Help", icon: Car },
    { id: "housing", label: "Housing Repair", icon: Wrench },
  ];

  const filteredProjects = projects?.filter(project => {
    if (!selectedCategory || selectedCategory === "all") return true;
    return project.category === selectedCategory;
  }) || [];

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    const Icon = categoryData?.icon || Heart;
    return <Icon className="h-5 w-5" />;
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Ongoing";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateProgress = (raised: number, goal: number) => {
    if (!goal) return 0;
    return Math.min((raised / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Community Help Projects
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Join us in making a difference in our community. Browse our active projects and find ways to help those in need through volunteering, donations, or prayer.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  data-testid={`filter-${category.id}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                {selectedCategory && selectedCategory !== "all" 
                  ? "No projects found in this category." 
                  : "No active projects at this time."}
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
                data-testid={`card-project-${project.id}`}
              >
                {project.imageUrl && (
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={project.status === "active" ? "default" : "secondary"}
                        data-testid={`badge-status-${project.id}`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      {getCategoryIcon(project.category)}
                      <CardTitle className="text-xl" data-testid={`text-title-${project.id}`}>
                        {project.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground" data-testid={`text-description-${project.id}`}>
                    {project.description}
                  </p>

                  {project.goal && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Funding Progress</span>
                        <span className="font-semibold">
                          ${project.raised?.toLocaleString() || 0} / ${project.goal.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={calculateProgress(project.raised || 0, project.goal)} 
                        className="h-2"
                        data-testid={`progress-${project.id}`}
                      />
                    </div>
                  )}

                  {project.volunteersNeeded && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Volunteers</span>
                      </div>
                      <span className="font-semibold" data-testid={`text-volunteers-${project.id}`}>
                        {project.volunteersSignedUp || 0} / {project.volunteersNeeded}
                      </span>
                    </div>
                  )}

                  {(project.startDate || project.endDate) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </span>
                    </div>
                  )}

                  {project.contactPerson && (
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{project.contactPerson}</span>
                      </div>
                      {project.contactEmail && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <a 
                            href={`mailto:${project.contactEmail}`}
                            className="hover:text-foreground transition-colors"
                            data-testid={`link-email-${project.id}`}
                          >
                            {project.contactEmail}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      data-testid={`button-volunteer-${project.id}`}
                    >
                      Volunteer
                    </Button>
                    {project.goal && (
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        size="sm"
                        data-testid={`button-donate-${project.id}`}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Donate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
