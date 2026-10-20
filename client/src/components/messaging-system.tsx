import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Send, 
  MessageCircle, 
  Users, 
  Hash,
  Clock
} from "lucide-react";
import type { Message } from "@shared/schema";

interface MessageWithSender extends Message {
  senderUsername: string;
  senderFirstName: string;
  senderLastName: string;
}

export default function MessagingSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeChannel, setActiveChannel] = useState("general");
  const [messageInput, setMessageInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages for active channel
  const { data: messages, isLoading } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/messages", activeChannel],
    enabled: !!user,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; channelType: string; channelId?: string }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", activeChannel] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // WebSocket connection for real-time messages
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message" && data.data.channelType === activeChannel) {
          queryClient.invalidateQueries({ queryKey: ["/api/messages", activeChannel] });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setWs(null);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [user, activeChannel]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !user) return;

    sendMessageMutation.mutate({
      content: messageInput.trim(),
      channelType: activeChannel,
      channelId: activeChannel === "general" ? undefined : activeChannel,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const channels = [
    { id: "general", name: "General", icon: Hash },
    { id: "prayer", name: "Prayer", icon: MessageCircle },
    { id: "study", name: "Bible Study", icon: Users },
  ];

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Join the Conversation
          </h3>
          <p className="text-muted-foreground">
            Sign in to participate in community discussions and connect with fellow believers.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Community Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Button
                  key={channel.id}
                  variant={activeChannel === channel.id ? "default" : "outline"}
                  onClick={() => setActiveChannel(channel.id)}
                  className="flex items-center space-x-2"
                  data-testid={`channel-${channel.id}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{channel.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center">
            {(() => {
              const activeChannelData = channels.find(ch => ch.id === activeChannel);
              const Icon = activeChannelData?.icon;
              return Icon ? <Icon className="mr-2 h-5 w-5" /> : null;
            })()}
            {channels.find(ch => ch.id === activeChannel)?.name} Chat
            {ws && (
              <div className="ml-auto flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Connected
              </div>
            )}
          </CardTitle>
        </CardHeader>
        
        {/* Messages Area */}
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))
              ) : messages?.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                <>
                  {messages?.reduce((acc, message, index) => {
                    const currentDate = formatDate(message.createdAt!);
                    const prevDate = index > 0 ? formatDate(messages[index - 1].createdAt!) : null;
                    
                    if (currentDate !== prevDate) {
                      acc.push(
                        <div key={`date-${currentDate}`} className="text-center py-2">
                          <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                            {currentDate}
                          </span>
                        </div>
                      );
                    }

                    acc.push(
                      <div key={message.id} className="group hover:bg-muted/30 p-2 rounded transition-colors">
                        <div className="flex items-baseline space-x-2 mb-1">
                          <span className="font-medium text-card-foreground text-sm">
                            {message.senderFirstName} {message.senderLastName}
                            {message.senderId === user.id && (
                              <span className="text-xs text-muted-foreground ml-1">(You)</span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatTime(message.createdAt!)}
                          </span>
                        </div>
                        <p className="text-card-foreground leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    );
                    
                    return acc;
                  }, [] as React.ReactNode[]) || []}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </ScrollArea>
          
          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message ${channels.find(ch => ch.id === activeChannel)?.name}...`}
                className="flex-1"
                disabled={sendMessageMutation.isPending || !ws}
                data-testid="input-message"
              />
              <Button
                type="submit"
                disabled={!messageInput.trim() || sendMessageMutation.isPending || !ws}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {!ws && (
              <p className="text-xs text-muted-foreground mt-2">
                Reconnecting to chat server...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
