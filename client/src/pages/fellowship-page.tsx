import { useState, useEffect } from "react";
import NavigationHeader from "@/components/navigation-header";
import VoiceChannels from "@/components/voice-channels";
import MessagingSystem from "@/components/messaging-system";
import ProfileSettingsDialog from "@/components/profile-settings-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Mic, 
  Heart, 
  Plus, 
  Send,
  Users,
  Clock,
  Settings,
  UserCircle,
  Mail,
  BookOpen,
  GraduationCap,
  Lightbulb
} from "lucide-react";
import type { PrayerRequest } from "@shared/schema";

export default function FellowshipPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"chat" | "voice" | "prayer" | "members">("chat");
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [memberFilter, setMemberFilter] = useState("");
  const [newPrayerRequest, setNewPrayerRequest] = useState({
    title: "",
    description: "",
    isAnonymous: false,
  });

  // Prayer requests query
  const { data: prayerRequests, isLoading: prayerRequestsLoading } = useQuery<PrayerRequest[]>({
    queryKey: ["/api/prayer-requests"],
  });

  // Fellowship members query
  const { data: fellowshipMembers, isLoading: membersLoading } = useQuery<any[]>({
    queryKey: ["/api/fellowship/members"],
  });

  // Create prayer request mutation
  const createPrayerRequestMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; isAnonymous: boolean }) => {
      const res = await apiRequest("POST", "/api/prayer-requests", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-requests"] });
      setNewPrayerRequest({ title: "", description: "", isAnonymous: false });
      toast({
        title: "Prayer request shared",
        description: "Your prayer request has been shared with the community.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to share prayer request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Pray for request mutation
  const prayForRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await apiRequest("POST", `/api/prayer-requests/${requestId}/pray`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-requests"] });
      toast({
        title: "Prayer added",
        description: "Thank you for praying for this request.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add prayer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitPrayerRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerRequest.title.trim() || !newPrayerRequest.description.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both title and description are required.",
        variant: "destructive",
      });
      return;
    }
    createPrayerRequestMutation.mutate(newPrayerRequest);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return past.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Fellowship Community
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome {user?.firstName}! Connect with fellow believers through chat, voice channels, and prayer.
          </p>
        </div>

        {/* Profile Settings Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => setProfileSettingsOpen(true)}
            data-testid="button-profile-settings"
          >
            <Settings className="mr-2 h-4 w-4" />
            My Profile
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            onClick={() => setActiveTab("chat")}
            className="rounded-md"
            data-testid="tab-chat"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat
          </Button>
          <Button
            variant={activeTab === "voice" ? "default" : "ghost"}
            onClick={() => setActiveTab("voice")}
            className="rounded-md"
            data-testid="tab-voice"
          >
            <Mic className="mr-2 h-4 w-4" />
            Voice Channels
          </Button>
          <Button
            variant={activeTab === "prayer" ? "default" : "ghost"}
            onClick={() => setActiveTab("prayer")}
            className="rounded-md"
            data-testid="tab-prayer"
          >
            <Heart className="mr-2 h-4 w-4" />
            Prayer Requests
          </Button>
          <Button
            variant={activeTab === "members" ? "default" : "ghost"}
            onClick={() => setActiveTab("members")}
            className="rounded-md"
            data-testid="tab-members"
          >
            <Users className="mr-2 h-4 w-4" />
            Members
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "chat" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MessagingSystem />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Online Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{user?.firstName} {user?.lastName}</span>
                      <Badge variant="outline" className="text-xs">You</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Other online members will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "voice" && (
          <VoiceChannels />
        )}

        {activeTab === "prayer" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Prayer Requests List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Prayer Requests</h2>
              
              {prayerRequestsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : prayerRequests?.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No prayer requests yet. Be the first to share a prayer request with the community.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {prayerRequests?.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-card-foreground">
                            {request.title}
                          </h3>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatTimeAgo(request.createdAt!)}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">
                          {request.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-muted-foreground">
                              By: {request.isAnonymous ? "Anonymous" : `${request.requesterFirstName} ${request.requesterLastName}`}
                            </span>
                            {request.isAnswered && (
                              <Badge variant="outline" className="text-xs">
                                Answered
                              </Badge>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => prayForRequestMutation.mutate(request.id)}
                            disabled={prayForRequestMutation.isPending}
                            data-testid={`button-pray-${request.id}`}
                          >
                            <Heart className="mr-1 h-3 w-3" />
                            Pray ({request.prayerCount})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Prayer Request */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Share Prayer Request
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitPrayerRequest} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Prayer request title"
                        value={newPrayerRequest.title}
                        onChange={(e) => setNewPrayerRequest(prev => ({ ...prev, title: e.target.value }))}
                        data-testid="input-prayer-title"
                      />
                    </div>
                    
                    <div>
                      <Textarea
                        placeholder="Share your prayer request with the community..."
                        value={newPrayerRequest.description}
                        onChange={(e) => setNewPrayerRequest(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        data-testid="textarea-prayer-description"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={newPrayerRequest.isAnonymous}
                        onChange={(e) => setNewPrayerRequest(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="anonymous" className="text-sm text-muted-foreground">
                        Submit anonymously
                      </label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createPrayerRequestMutation.isPending}
                      data-testid="button-submit-prayer"
                    >
                      {createPrayerRequestMutation.isPending ? (
                        "Sharing..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Share Prayer Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div>
            {/* Filter Section */}
            <div className="mb-6 flex gap-4">
              <Input
                placeholder="Search by name, interests, or ministry..."
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="max-w-md"
                data-testid="input-member-filter"
              />
            </div>

            {/* Members Grid */}
            {membersLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : fellowshipMembers && fellowshipMembers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fellowshipMembers
                  .filter(member => {
                    if (!memberFilter) return true;
                    const searchLower = memberFilter.toLowerCase();
                    return (
                      member.displayName?.toLowerCase().includes(searchLower) ||
                      member.interests?.some((i: string) => i.toLowerCase().includes(searchLower)) ||
                      member.ministryPreferences?.some((m: string) => m.toLowerCase().includes(searchLower)) ||
                      member.wantToLearn?.some((l: string) => l.toLowerCase().includes(searchLower)) ||
                      member.wantToTeach?.some((t: string) => t.toLowerCase().includes(searchLower))
                    );
                  })
                  .map((member) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow" data-testid={`card-member-${member.id}`}>
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg" data-testid={`text-member-name-${member.id}`}>
                              {member.displayName}
                            </CardTitle>
                            {member.email && (
                              <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <Mail className="mr-1 h-3 w-3" />
                                {member.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {member.interests && member.interests.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Interests</p>
                            <div className="flex flex-wrap gap-1">
                              {member.interests.map((interest: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {member.ministryPreferences && member.ministryPreferences.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center">
                              <BookOpen className="mr-1 h-3 w-3" />
                              Ministry
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {member.ministryPreferences.map((ministry: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {ministry}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {member.wantToLearn && member.wantToLearn.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center">
                              <GraduationCap className="mr-1 h-3 w-3" />
                              Wants to Learn
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {member.wantToLearn.map((learn: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950">
                                  {learn}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {member.wantToTeach && member.wantToTeach.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center">
                              <Lightbulb className="mr-1 h-3 w-3" />
                              Can Teach
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {member.wantToTeach.map((teach: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-green-50 dark:bg-green-950">
                                  {teach}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No members found. Check back later.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <ProfileSettingsDialog open={profileSettingsOpen} onOpenChange={setProfileSettingsOpen} />
    </div>
  );
}
