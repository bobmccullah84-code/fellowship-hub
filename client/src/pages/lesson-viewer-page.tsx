import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import NavigationHeader from "@/components/navigation-header";
import { DualPaneViewer } from "@/components/dual-pane-viewer";
import { ArrowLeft, X } from "lucide-react";
import type { Lesson, Course } from "@shared/schema";

export default function LessonViewerPage() {
  const [, params] = useRoute("/course/:courseId/lesson/:lessonId");
  const [, setLocation] = useLocation();
  const courseId = params?.courseId;
  const lessonId = params?.lessonId;

  // Fetch course details
  const { data: course } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch lesson details
  const { data: lesson, isLoading } = useQuery<Lesson>({
    queryKey: [`/api/lessons/${lessonId}`],
    enabled: !!lessonId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-muted-foreground">Lesson not found</p>
        </div>
      </div>
    );
  }

  const contentType = lesson.contentType || "video";

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation(`/course/${courseId}`)}
          className="mb-6"
          data-testid="button-back-to-course"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>

        <Card className="overflow-hidden">
          <div className="relative bg-black">
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
              <div className="flex items-center justify-between text-white">
                <h3 className="font-semibold truncate" data-testid="text-lesson-title">{lesson.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation(`/course/${courseId}`)}
                  className="text-white hover:bg-white/20"
                  data-testid="button-close-lesson"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className={contentType === "text" ? "" : "aspect-video"}>
              <DualPaneViewer
                contentType={contentType}
                videoUrl={lesson.videoUrl}
                audioUrl={lesson.audioUrl}
                documentUrl={lesson.documentUrl}
                content={lesson.content}
                title={lesson.title}
              />
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-card-foreground" data-testid="text-lesson-title-detail">{lesson.title}</h2>
                {course && (
                  <p className="text-muted-foreground">From: {course.title}</p>
                )}
              </div>
              
              {lesson.description && (
                <p className="text-card-foreground leading-relaxed" data-testid="text-lesson-description">
                  {lesson.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
