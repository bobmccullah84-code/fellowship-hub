import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import NavigationHeader from "@/components/navigation-header";
import { useAuth } from "@/hooks/use-auth";
import { 
  Play, 
  BookOpen, 
  Video, 
  Award,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock
} from "lucide-react";
import type { Course, Lesson, UserProgress } from "@shared/schema";

export default function CourseDetailPage() {
  const [, params] = useRoute("/course/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const courseId = params?.id;

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch lessons for the course
  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });

  // Fetch user progress for the course (only if user is authenticated)
  const { data: userProgress } = useQuery<UserProgress[]>({
    queryKey: [`/api/courses/${courseId}/progress`],
    enabled: !!courseId && !!user,
  });

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    if (!userProgress) return false;
    return userProgress.some(p => p.lessonId === lessonId && p.completed);
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!lessons || !userProgress || lessons.length === 0) return 0;
    const completedLessons = userProgress.filter(p => p.completed).length;
    return Math.round((completedLessons / lessons.length) * 100);
  };

  // Handle lesson click
  const handleLessonClick = (lesson: Lesson) => {
    // If it's the first lesson (order = 1) of Foundations of Faith, show outline
    if (lesson.order === 1 && course?.title?.toLowerCase().includes("foundations")) {
      setLocation("/foundations-outline");
    } else {
      // Navigate to lesson viewer
      setLocation(`/course/${courseId}/lesson/${lesson.id}`);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (courseLoading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-muted-foreground">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
          data-testid="button-back-home"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Course Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Badge className="mb-3" data-testid="badge-lesson-count">
                  {lessons?.length || 0}-Lesson Course
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="text-course-title">
                  {course.title}
                </h1>
                <p className="text-lg text-muted-foreground" data-testid="text-course-description">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {user && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Your Progress</span>
                  <span className="text-sm text-muted-foreground" data-testid="text-progress-percentage">
                    {calculateProgress()}% Complete
                  </span>
                </div>
                <Progress value={calculateProgress()} className="w-full" data-testid="progress-bar" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-lessons-title">Course Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lessons && lessons.length > 0 ? (
                lessons.map((lesson) => {
                  const isCompleted = isLessonCompleted(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-all duration-200 group"
                      data-testid={`button-lesson-${lesson.order}`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Lesson Number */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-primary" data-testid={`icon-completed-${lesson.order}`} />
                          ) : (
                            <span className="text-lg font-semibold text-primary" data-testid={`text-lesson-number-${lesson.order}`}>
                              {lesson.order}
                            </span>
                          )}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors" data-testid={`text-lesson-title-${lesson.order}`}>
                            {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1" data-testid={`text-lesson-description-${lesson.order}`}>
                              {lesson.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {lesson.contentType && (
                              <span className="flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                {lesson.contentType}
                              </span>
                            )}
                            {lesson.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Play Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center">
                            <Play className="h-5 w-5 text-primary group-hover:text-white" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">No lessons available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
