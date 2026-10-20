import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Headphones, 
  Circle,
  Info,
  Hash,
  MessageCircle,
  ArrowRight
} from "lucide-react";
import type { VoiceChannel } from "@shared/schema";

export default function LiveActivity() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Voice channels query
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


  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Live Fellowship Activity
          </h2>
          <p className="text-lg text-muted-foreground">
            Join live conversations and connect with fellow believers right now
          </p>
        </div>
        
        <div className="flex justify-center">
          {/* Voice Channels */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Voice Channels</CardTitle>
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  <Circle className="text-green-500 mr-1 h-3 w-3 fill-current" />
                  {channelsLoading ? "..." : `${voiceChannels?.length || 0} Live`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
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
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No active voice channels at the moment</p>
                  </div>
                ) : (
                  voiceChannels?.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
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
                        data-testid={`button-listen-${channel.id}`}
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
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                      onClick={() => handleJoinTextChannel(channel.type)}
                      data-testid={`text-channel-${channel.id}`}
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
                        data-testid={`button-join-text-${channel.id}`}
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                <div className="flex items-center text-accent">
                  <Info className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">
                    {user ? "Join voice discussions" : "Join as a guest to listen"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {user 
                    ? "Participate in voice discussions and connect with the community"
                    : "Register to participate in voice discussions and connect with the community"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
