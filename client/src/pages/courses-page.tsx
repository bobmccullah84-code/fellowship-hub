import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import NavigationHeader from "@/components/navigation-header";
import { 
  Play, 
  BookOpen, 
  Video, 
  Award,
  Users,
  ArrowRight
} from "lucide-react";
import type { Course } from "@shared/schema";

export default function CoursesPage() {
  const [, setLocation] = useLocation();

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const handleViewCourse = (courseId: string) => {
    setLocation(`/course/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="shadow-lg">
                <CardContent className="p-8">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-20 w-full mb-6" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4" data-testid="heading-courses">
            Discipleship Courses
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Start your spiritual growth journey with our comprehensive discipleship programs designed for believers at every stage.
          </p>
        </div>

        {!courses || courses.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Courses Available
              </h3>
              <p className="text-muted-foreground">
                Check back soon for new discipleship courses.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card key={course.id} className="shadow-lg hover:shadow-xl transition-shadow" data-testid={`card-course-${course.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-accent text-accent-foreground">
                      {course.totalLessons || 0}-Lesson Course
                    </Badge>
                    <span className="text-muted-foreground text-sm flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      Free
                    </span>
                  </div>
                  <CardTitle className="text-2xl text-foreground" data-testid={`title-course-${course.id}`}>
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Video className="text-primary mr-2 h-4 w-4" />
                      <span className="text-foreground">{course.totalLessons || 0} Video Lessons</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <BookOpen className="text-primary mr-2 h-4 w-4" />
                      <span className="text-foreground">Study Materials</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Award className="text-primary mr-2 h-4 w-4" />
                      <span className="text-foreground">Completion Certificate</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleViewCourse(course.id)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid={`button-view-course-${course.id}`}
                  >
                    View Course
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
