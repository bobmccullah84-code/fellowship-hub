import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Play, 
  List, 
  Video, 
  BookOpen, 
  MessageCircle, 
  Award,
  Users,
  Info,
  Clock,
  Eye,
  ArrowRight,
  FileText
} from "lucide-react";
import type { Course, Lesson, UserProgress, Teaching } from "@shared/schema";

export default function DiscipleshipCourse() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch courses and get the featured course (first one)
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const featuredCourse = courses?.[0];

  // Fetch lessons for the featured course
  const { data: lessons } = useQuery<Lesson[]>({
    queryKey: ["/api/courses", featuredCourse?.id, "lessons"],
    enabled: !!featuredCourse?.id,
  });

  // Fetch user progress for the featured course (only if user is authenticated)
  const { data: userProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/courses", featuredCourse?.id, "progress"],
    enabled: !!featuredCourse?.id && !!user,
  });

  // Fetch user certificate for the featured course (only if user is authenticated)
  const { data: certificate } = useQuery<any>({
    queryKey: ["/api/certificates", featuredCourse?.id],
    queryFn: async () => {
      const response = await fetch(`/api/certificates/${featuredCourse?.id}`);
      if (!response.ok) {
        if (response.status === 404) return null; // No certificate yet
        throw new Error('Failed to fetch certificate');
      }
      return response.json();
    },
    enabled: !!featuredCourse?.id && !!user,
  });

  // Fetch teachings for Latest Teachings card
  const { data: teachings, isLoading: teachingsLoading } = useQuery<Teaching[]>({
    queryKey: ["/api/teachings"],
  });

  const recentTeachings = teachings?.slice(0, 5) || [];

  // Helper function to determine content type
  const getContentType = (teaching: Teaching) => {
    if (teaching.documentUrl) return 'document';
    if (teaching.videoUrl) return 'video';
    if (teaching.audioUrl) return 'audio';
    return 'text'; // Default to text for any other content
  };

  // Helper function to get content icon
  const getContentIcon = (teaching: Teaching) => {
    const contentType = getContentType(teaching);
    switch (contentType) {
      case 'document':
        return <FileText className="h-4 w-4 text-amber-600" />;
      case 'video':
        return <Video className="h-4 w-4 text-primary" />;
      case 'audio':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'text':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <Play className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!lessons || !userProgress || lessons.length === 0) return 0;
    const completedLessons = userProgress.filter(p => p.completed).length;
    return Math.round((completedLessons / lessons.length) * 100);
  };

  // Check if course is completed
  const isCourseCompleted = () => {
    return calculateProgress() === 100;
  };

  const handleStartCourse = () => {
    if (featuredCourse) {
      setLocation(`/course/${featuredCourse.id}`);
    }
  };

  const handleViewCurriculum = () => {
    // In a real app, this would show the curriculum modal or page
    alert("Curriculum viewer would open here");
  };

  const handlePlayTeaching = (teachingId: string) => {
    setLocation(`/teachings`);
  };

  const handleViewAllTeachings = () => {
    setLocation("/teachings");
  };

  const formatViews = (views: number | null) => {
    if (!views) return "0";
    if (views < 1000) return views.toString();
    if (views < 1000000) return `${(views / 1000).toFixed(1)}k`;
    return `${(views / 1000000).toFixed(1)}M`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (isLoading || !featuredCourse) {
    return (
      <section id="courses" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Featured Discipleship Course
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Start your spiritual growth journey with our comprehensive discipleship program designed for believers at every stage.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Latest Teachings Card - Loading State */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex space-x-4 p-4 hover:bg-muted rounded-lg">
                      <Skeleton className="w-16 h-12 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Discipleship Course - Loading State */}
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-8 lg:p-12">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center mb-4">
                      <Skeleton className="h-6 w-24 mr-3" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            {/* Featured Discipleship Course Heading */}
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6" data-testid="heading-featured-course">
              Featured Discipleship Course
            </h3>
            <Card className="overflow-hidden shadow-lg">
            
            {/* Course Content */}
            <CardContent className="p-8 lg:p-12">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-4">
                    <Badge className="bg-accent text-accent-foreground mr-3">
                      {lessons?.length || featuredCourse.totalLessons || 0}-Lesson Course
                    </Badge>
                    <span className="text-muted-foreground text-sm flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      Free to all
                    </span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {featuredCourse.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    {featuredCourse.description}
                  </p>
                </div>
                
                {/* Course Features */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Video className="text-primary mr-3 h-5 w-5" />
                    <span className="text-gray-900 dark:text-gray-100">{lessons?.length || 0} Video Lessons</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="text-primary mr-3 h-5 w-5" />
                    <span className="text-gray-900 dark:text-gray-100">Study Materials</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-gray-900 dark:text-gray-100">Group Discussions</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="text-primary mr-3 h-5 w-5" />
                    <span className="text-gray-900 dark:text-gray-100">Completion Certificate</span>
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={handleStartCourse}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="button-start-course"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Course (Free)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleViewCurriculum}
                    data-testid="button-view-curriculum"
                  >
                    <List className="mr-2 h-4 w-4" />
                    View Curriculum
                  </Button>
                </div>
                
                {/* Progress Preview */}
                {user && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Course Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {calculateProgress()}% Complete
                      </span>
                    </div>
                    <Progress value={calculateProgress()} className="w-full mb-2" />
                    {isCourseCompleted() && certificate && (
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-2">
                        <Award className="mr-1 h-3 w-3" />
                        Completion certificate earned!
                      </div>
                    )}
                    {!isCourseCompleted() && (
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Info className="mr-1 h-3 w-3" />
                        Progress saved automatically
                      </p>
                    )}
                  </div>
                )}
                {!user && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Course Progress</span>
                      <span className="text-sm text-muted-foreground">Sign in to track progress</span>
                    </div>
                    <Progress value={0} className="w-full mb-2" />
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Info className="mr-1 h-3 w-3" />
                      Progress saved automatically for registered members
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>

          <div>
            {/* Latest Teachings Heading */}
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6" data-testid="heading-latest-teachings">
              Latest Teachings
            </h3>
            <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAllTeachings}
                  className="text-primary hover:text-primary/80"
                  data-testid="button-view-all-teachings"
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teachingsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex space-x-4 p-4 hover:bg-muted rounded-lg">
                      <Skeleton className="w-16 h-12 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : recentTeachings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No teachings available</p>
                  </div>
                ) : (
                  recentTeachings.map((teaching) => (
                    <div
                      key={teaching.id}
                      className="flex space-x-4 p-4 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                      onClick={() => handlePlayTeaching(teaching.id)}
                      data-testid={`teaching-${teaching.id}`}
                    >
                      <div className="w-16 h-12 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-border">
                        {teaching.thumbnailUrl ? (
                          <a
                            href={teaching.documentUrl || teaching.videoUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-full flex items-center justify-center bg-black"
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`link-teaching-thumbnail-${teaching.id}`}
                          >
                            <img
                              src={teaching.thumbnailUrl}
                              alt={teaching.title}
                              className="w-full h-full object-contain"
                            />
                          </a>
                        ) : (
                          <a
                            href={teaching.documentUrl || teaching.videoUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`link-teaching-thumbnail-${teaching.id}`}
                          >
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </a>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {teaching.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {teaching.speaker}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 space-x-3">
                          <div className="flex items-center">
                            {getContentIcon(teaching)}
                            <span className="ml-1 capitalize text-xs">{getContentType(teaching)}</span>
                          </div>
                          {getContentType(teaching) !== "document" && (
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>{formatDuration(teaching.duration)}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Eye className="mr-1 h-3 w-3" />
                            <span>{formatViews(teaching.views)} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
