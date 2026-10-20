import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/contexts/SettingsContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "./video-player";
import { Play, UserPlus, Clock, Eye, Circle, Headphones, Info, Hash, MessageCircle, ArrowRight } from "lucide-react";
import type { Teaching, VoiceChannel } from "@shared/schema";

// Static class mappings for Tailwind (required for build-time detection)
const getTitleClasses = (size?: string) => {
  switch (size) {
    case 'sm': return 'text-sm lg:text-base';
    case 'base': return 'text-base lg:text-lg';
    case 'lg': return 'text-lg lg:text-xl';
    case 'xl': return 'text-xl lg:text-2xl';
    case '2xl': return 'text-2xl lg:text-3xl';
    case '3xl': return 'text-3xl lg:text-4xl';
    case '4xl': return 'text-4xl lg:text-5xl';
    case '5xl': return 'text-5xl lg:text-6xl';
    case '6xl': return 'text-6xl lg:text-7xl';
    default: return 'text-4xl lg:text-6xl';
  }
};

const getSubtitleClasses = (size?: string) => {
  switch (size) {
    case 'sm': return 'text-sm lg:text-sm';
    case 'base': return 'text-base lg:text-base';
    case 'lg': return 'text-lg lg:text-lg';
    case 'xl': return 'text-xl lg:text-xl';
    case '2xl': return 'text-2xl lg:text-2xl';
    case '3xl': return 'text-3xl lg:text-3xl';
    case '4xl': return 'text-4xl lg:text-4xl';
    case '5xl': return 'text-5xl lg:text-5xl';
    case '6xl': return 'text-6xl lg:text-6xl';
    default: return 'text-lg lg:text-xl';
  }
};

export default function HeroSection() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [, setLocation] = useLocation();
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);
  const [hasViewedWelcome, setHasViewedWelcome] = useState(false);

  // Check localStorage for welcome video viewed status
  useEffect(() => {
    const welcomeViewed = localStorage.getItem('FH_WELCOME_VIEWED');
    if (welcomeViewed) {
      setHasViewedWelcome(true);
    } else {
      // First visit - auto-play welcome video
      setShowWelcomeVideo(true);
      setHasViewedWelcome(false);
    }
  }, []);

  // Voice channels query for the hero section
  const { data: voiceChannels, isLoading: channelsLoading } = useQuery<VoiceChannel[]>({
    queryKey: ["/api/voice-channels"],
  });

  // Text channel data with mock participant counts
  const textChannels = [
    { id: "general", name: "General", type: "general", participants: 47 },
    { id: "prayer", name: "Prayer Requests", type: "prayer", participants: 23 },
    { id: "study", name: "Bible Study", type: "study", participants: 18 }
  ];

  const totalTextParticipants = textChannels.reduce((sum, channel) => sum + channel.participants, 0);

  // Mock welcome video data - in a real app this would come from the API
  const welcomeVideo: Teaching = {
    id: "welcome-video",
    title: "Welcome to Fellowship Hub",
    description: "Discover how our community can help you grow in your faith journey through discipleship and fellowship.",
    speaker: "Pastor John Smith",
    videoUrl: "https://example.com/welcome-video.mp4",
    audioUrl: null,
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    duration: 272, // 4:32
    views: 12847,
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const handleStartJourney = () => {
    if (user) {
      setLocation("/fellowship");
    } else {
      setLocation("/auth");
    }
  };

  const handleWatchVideo = () => {
    setShowWelcomeVideo(true);
  };

  const handleCloseVideo = () => {
    setShowWelcomeVideo(false);
    // Mark as viewed in localStorage
    localStorage.setItem('FH_WELCOME_VIEWED', 'true');
    setHasViewedWelcome(true);
  };

  const handleListenToChannel = () => {
    if (user) {
      setLocation("/fellowship");
    } else {
      setLocation("/auth");
    }
  };

  const handleJoinTextChannel = (channelType: string) => {
    if (user) {
      setLocation("/fellowship");
    } else {
      setLocation("/auth");
    }
  };

  const handleScrollToContent = () => {
    const coursesSection = document.getElementById("courses");
    coursesSection?.scrollIntoView({ behavior: "smooth" });
  };

  const formatViews = (views: number) => {
    if (views < 1000) return views.toString();
    if (views < 1000000) return `${(views / 1000).toFixed(1)}k`;
    return `${(views / 1000000).toFixed(1)}M`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };

  // Video Player Modal Overlay (shown on top of hero content)
  const videoPlayerOverlay = showWelcomeVideo && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl">
        <VideoPlayer
          teaching={welcomeVideo}
          onClose={handleCloseVideo}
          autoPlay={true}
        />
      </div>
    </div>
  );

  return (
    <section className="hero-gradient text-primary-foreground py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className={`${getTitleClasses(settings?.typography?.heroTitleSize)} font-bold leading-tight text-[#ffc200]`}>
                {settings?.heroTitle || "For Serious Followers of Christ"}
              </h1>
              <p className={`${getSubtitleClasses(settings?.typography?.heroSubtitleSize)} text-primary-foreground/80 max-w-lg`}>
                {settings?.heroSubtitle || "Join us in worship, fellowship, and spiritual growth"}
              </p>
              <p className="text-base text-primary-foreground/90 max-w-lg">
                Join our online Christian fellowship for discipleship, teachings, and meaningful connections with believers worldwide.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleStartJourney}
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-4 text-lg font-semibold"
                data-testid="button-start-journey"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
              <Button
                variant="outline"
                onClick={handleWatchVideo}
                className="border-2 border-primary-foreground/30 text-blue-600 hover:bg-primary-foreground/10 px-8 py-4 text-lg font-semibold"
                data-testid="button-watch-video"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Welcome Video
              </Button>
            </div>
            
            {/* Stats */}
            <div className="flex gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">2,847</div>
                <div className="text-sm text-primary-foreground/80">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">156</div>
                <div className="text-sm text-primary-foreground/80">Teachings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">42</div>
                <div className="text-sm text-primary-foreground/80">Countries</div>
              </div>
            </div>
          </div>
          
          {/* Active Voice Channels Card - moved to right side */}
          <div className="relative w-4/5 ml-auto">
            <Card className="shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground">Active Voice Channels</CardTitle>
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    <Circle className="text-green-500 mr-1 h-3 w-3 fill-current" />
                    <span className="bg-blue-600 px-2 py-1 rounded text-xs text-[#ffff4b]">
                      {channelsLoading ? "..." : `${voiceChannels?.length || 0} Live`}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelsLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-3 h-3 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    ))
                  ) : voiceChannels?.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No active voice channels</p>
                    </div>
                  ) : (
                    voiceChannels?.slice(0, 2).map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg shadow-md hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"></div>
                          <div>
                            <div className="font-medium text-card-foreground">{channel.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {channel.participantCount || 0} participants
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleListenToChannel}
                          className="text-primary hover:text-primary/80"
                          data-testid={`button-listen-hero-${channel.id}`}
                        >
                          <Headphones className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Text Chat Channels Section */}
                <div className="mt-6 border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="font-medium text-card-foreground">Text Chat Channels</span>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {totalTextParticipants} Active
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {textChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg shadow-md hover:bg-blue-100 transition-colors cursor-pointer"
                        onClick={() => handleJoinTextChannel(channel.type)}
                        data-testid={`text-channel-hero-${channel.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-card-foreground text-sm">{channel.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {channel.participants} participants
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:text-primary/80 h-7 w-7 p-0"
                          data-testid={`button-join-text-hero-${channel.id}`}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-center text-blue-600">
                      <Info className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">
                        Click on the channels to listen
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setLocation("/auth")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                      data-testid="button-register-participate"
                    >
                      Register to participate in the channels
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Video Player Overlay */}
      {videoPlayerOverlay}
    </section>
  );
}
