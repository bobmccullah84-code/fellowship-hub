import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useVoiceRoom } from "@/hooks/use-voice-room";
import { 
  Mic, 
  MicOff, 
  Volume2,
  User,
  Crown,
  Hash,
  Loader2,
  AlertTriangle
} from "lucide-react";
import type { VoiceChannel } from "@shared/schema";

interface Participant {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  isMuted: boolean;
  isMutedByModerator: boolean;
}

interface VoiceChannelWithParticipants extends VoiceChannel {
  participantCount: number;
  participants: Participant[];
}

export default function VoiceChannels() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [joinedChannelId, setJoinedChannelId] = useState<string | null>(null);

  // Fetch voice channels
  const { data: channels, isLoading } = useQuery<VoiceChannelWithParticipants[]>({
    queryKey: ["/api/voice-channels"],
    refetchInterval: 3000,
  });

  const joinedChannel = channels?.find(ch => ch.id === joinedChannelId);
  const currentUserParticipant = joinedChannel?.participants.find(p => p.userId === user?.id);
  const isUserMuted = currentUserParticipant?.isMuted || currentUserParticipant?.isMutedByModerator || false;
  const isModerator = user && joinedChannel && (joinedChannel.moderatorId === user.id || joinedChannel.createdBy === user.id || user.isAdmin);

  // Live audio for the joined channel
  const voice = useVoiceRoom({
    channelId: joinedChannelId,
    userId: user?.id,
    muted: isUserMuted,
    onDisconnected: (reason) => {
      setJoinedChannelId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/voice-channels"] });
      toast({ title: "Left voice channel", description: reason, variant: "destructive" });
    },
  });

  // Join channel mutation
  const joinChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await apiRequest("POST", `/api/voice-channels/${channelId}/join`);
      return await res.json();
    },
    onSuccess: (_, channelId) => {
      setJoinedChannelId(channelId);
      queryClient.invalidateQueries({ queryKey: ["/api/voice-channels"] });
      toast({
        title: "Joined voice channel",
      });
    },
  });

  // Leave channel mutation
  const leaveChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await apiRequest("POST", `/api/voice-channels/${channelId}/leave`);
      return await res.json();
    },
    onSuccess: () => {
      setJoinedChannelId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/voice-channels"] });
      toast({
        title: "Left voice channel",
      });
    },
  });

  // Toggle self mute
  const toggleMuteMutation = useMutation({
    mutationFn: async ({ channelId, isMuted }: { channelId: string; isMuted: boolean }) => {
      const res = await apiRequest("POST", `/api/voice-channels/${channelId}/toggle-mute`, { isMuted });
      return await res.json();
    },
    onSuccess: (_, { isMuted }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-channels"] });
      toast({
        title: isMuted ? "Muted" : "Unmuted",
      });
    },
  });

  // Moderator mute
  const moderatorMuteMutation = useMutation({
    mutationFn: async ({ channelId, targetUserId, isMuted }: { channelId: string; targetUserId: string; isMuted: boolean }) => {
      const res = await apiRequest("POST", `/api/voice-channels/${channelId}/moderator-mute`, { targetUserId, isMuted });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-channels"] });
    },
  });

  const handleJoinChannel = (channelId: string) => {
    if (joinedChannelId && joinedChannelId !== channelId) {
      leaveChannelMutation.mutate(joinedChannelId);
    }
    joinChannelMutation.mutate(channelId);
  };

  const handleLeaveChannel = () => {
    if (joinedChannelId) {
      leaveChannelMutation.mutate(joinedChannelId);
    }
  };

  const toggleSelfMute = () => {
    if (joinedChannelId && currentUserParticipant && !currentUserParticipant.isMutedByModerator) {
      toggleMuteMutation.mutate({
        channelId: joinedChannelId,
        isMuted: !currentUserParticipant.isMuted,
      });
    }
  };

  const toggleModeratorMute = (targetUserId: string, isMuted: boolean) => {
    if (joinedChannelId && isModerator) {
      moderatorMuteMutation.mutate({
        channelId: joinedChannelId,
        targetUserId,
        isMuted: !isMuted,
      });
    }
  };

  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = parseInt(userId.slice(-2), 16) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Channels List - Discord Style */}
      {channels?.map((channel) => {
        const isJoined = channel.id === joinedChannelId;
        
        return (
          <Card 
            key={channel.id} 
            className={`${isJoined ? 'bg-gray-800 dark:bg-gray-700' : 'bg-gray-900 dark:bg-gray-800'} border-gray-700 dark:border-gray-600`}
          >
            <CardContent className="p-4">
              {/* Channel Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-white text-base">
                      {channel.name}
                    </h3>
                    {channel.description && (
                      <p className="text-xs text-gray-400">{channel.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                    {channel.participantCount} / {channel.maxParticipants || 50}
                  </Badge>
                  {!isJoined && user && (
                    <Button
                      size="sm"
                      onClick={() => handleJoinChannel(channel.id)}
                      disabled={
                        !channel.isActive || 
                        channel.participantCount >= channel.maxParticipants ||
                        joinChannelMutation.isPending
                      }
                      className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                      data-testid={`button-join-${channel.id}`}
                    >
                      Join
                    </Button>
                  )}
                  {isJoined && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleLeaveChannel}
                      className="h-7 text-xs"
                      data-testid="button-leave-channel"
                    >
                      Leave
                    </Button>
                  )}
                </div>
              </div>

              {/* Participants List - Discord Style */}
              {channel.participants.length > 0 && (
                <div className="space-y-1 mt-3 pt-3 border-t border-gray-700">
                  {channel.participants.map((participant) => {
                    const isCurrentUser = participant.userId === user?.id;
                    const isMuted = participant.isMuted || participant.isMutedByModerator;
                    const canModerate = isModerator && !isCurrentUser && isJoined;
                    
                    return (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                        data-testid={`participant-${participant.userId}`}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(participant.userId)} flex items-center justify-center text-white font-semibold text-sm transition-shadow ${isJoined && voice.speaking.has(participant.userId) && !isMuted ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-gray-900' : ''}`}>
                            {participant.firstName[0]}{participant.lastName[0]}
                          </div>
                          
                          {/* Name */}
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${isCurrentUser ? 'text-white font-medium' : 'text-gray-300'}`}>
                              {participant.firstName} {participant.lastName}
                              {isCurrentUser && ' (You)'}
                            </span>
                            {(channel.moderatorId === participant.userId || channel.createdBy === participant.userId) && (
                              <Crown className="h-3 w-3 text-yellow-500" data-testid={`crown-${participant.userId}`} />
                            )}
                          </div>
                        </div>

                        {/* Mute Icons */}
                        <div className="flex items-center space-x-2">
                          {participant.isMutedByModerator && (
                            <Hash className="h-4 w-4 text-red-500" data-testid={`moderator-muted-${participant.userId}`} />
                          )}
                          {isMuted && (
                            <MicOff className="h-4 w-4 text-red-500" data-testid={`muted-${participant.userId}`} />
                          )}
                          
                          {/* Moderator Controls */}
                          {canModerate && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleModeratorMute(participant.userId, participant.isMutedByModerator)}
                              className="h-6 w-6 p-0 hover:bg-gray-700"
                              data-testid={`moderator-mute-button-${participant.userId}`}
                            >
                              {participant.isMutedByModerator ? (
                                <Mic className="h-3 w-3 text-green-500" />
                              ) : (
                                <MicOff className="h-3 w-3 text-gray-400" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Self Mute Control - Discord Style */}
              {isJoined && user && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.id)} flex items-center justify-center text-white font-semibold text-sm`}>
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <span className="text-sm text-white font-medium">{user.firstName} {user.lastName}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={isUserMuted ? "destructive" : "secondary"}
                      onClick={toggleSelfMute}
                      disabled={currentUserParticipant?.isMutedByModerator || toggleMuteMutation.isPending}
                      className={`h-8 w-8 p-0 ${currentUserParticipant?.isMutedByModerator ? 'opacity-50 cursor-not-allowed' : ''}`}
                      data-testid="button-toggle-self-mute"
                    >
                      {isUserMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                  {currentUserParticipant?.isMutedByModerator && (
                    <p className="text-xs text-red-400 mt-2">You have been muted by a moderator</p>
                  )}
                  <div className="mt-2 text-xs" data-testid="voice-status">
                    {voice.status === "connecting" && (
                      <span className="flex items-center text-gray-400"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Connecting audio…</span>
                    )}
                    {voice.status === "connected" && (
                      <span className="text-green-400">
                        Voice connected{channel.participants.length > 1 ? ` · hearing ${voice.connectedPeers.length} of ${channel.participants.length - 1}` : " · waiting for others to join"}
                      </span>
                    )}
                    {voice.status === "error" && <span className="text-red-400">Voice connection problem</span>}
                  </div>
                  {!voice.micAvailable && (
                    <p className="flex items-start text-xs text-yellow-400 mt-2">
                      <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
                      Microphone blocked — you can listen but others can't hear you. Allow microphone access in your browser's address bar, then leave and rejoin.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {channels?.length === 0 && (
        <div className="text-center py-8">
          <Volume2 className="mx-auto h-12 w-12 text-gray-600 dark:text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No voice channels available</p>
        </div>
      )}

      {!user && (
        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Sign in to join voice channels</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
