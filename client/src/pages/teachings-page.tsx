import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import VideoPlayer from "@/components/video-player";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Play, Clock, Eye, Filter, FileText, Headphones } from "lucide-react";
import type { Teaching } from "@shared/schema";

export default function TeachingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeaching, setSelectedTeaching] = useState<Teaching | null>(null);

  const { data: teachings, isLoading } = useQuery<Teaching[]>({
    queryKey: ["/api/teachings"],
  });

  const filteredTeachings = teachings?.filter(teaching =>
    teaching.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teaching.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number | null) => {
    if (!views) return "0 views";
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views / 1000).toFixed(1)}k views`;
    return `${(views / 1000000).toFixed(1)}M views`;
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Teachings & Sermons
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Explore our library of biblical teachings, sermons, and spiritual content from trusted Christian speakers.
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search teachings or speakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-teachings"
              />
            </div>
            <Button variant="outline" className="whitespace-nowrap">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {selectedTeaching && (
          <div className="mb-8">
            <VideoPlayer
              teaching={selectedTeaching}
              onClose={() => setSelectedTeaching(null)}
            />
          </div>
        )}

        {/* Teachings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredTeachings.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? "No teachings found matching your search." : "No teachings available."}
              </p>
            </div>
          ) : (
            filteredTeachings.map((teaching) => {
              const isDocument = !!teaching.documentUrl && !teaching.videoUrl && !teaching.audioUrl;
              const isAudio = !!teaching.audioUrl && !teaching.videoUrl;

              const handleCardClick = () => {
                if (isDocument) {
                  window.open(teaching.documentUrl!, "_blank", "noopener,noreferrer");
                } else {
                  setSelectedTeaching(teaching);
                }
              };

              return (
              <Card
                key={teaching.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleCardClick}
                data-testid={`card-teaching-${teaching.id}`}
              >
                <div className="relative aspect-video bg-muted">
                  {teaching.thumbnailUrl ? (
                    <img
                      src={teaching.thumbnailUrl}
                      alt={teaching.title}
                      className={`w-full h-full ${isDocument ? "object-contain bg-white" : "object-cover"}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      {isDocument ? (
                        <FileText className="h-12 w-12 text-amber-500" />
                      ) : isAudio ? (
                        <Headphones className="h-12 w-12 text-muted-foreground" />
                      ) : (
                        <Play className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  )}

                  {/* Hover overlay — only for non-documents */}
                  {!isDocument && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="sm" className="bg-primary/90 hover:bg-primary">
                        {isAudio ? (
                          <><Headphones className="h-4 w-4 mr-2" />Listen</>
                        ) : (
                          <><Play className="h-4 w-4 mr-2" />Play</>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Document badge */}
                  {isDocument && (
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 right-2 bg-amber-600/90 text-white"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      PDF
                    </Badge>
                  )}

                  {/* Duration badge — only for non-documents */}
                  {!isDocument && teaching.duration && (
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 right-2 bg-black/70 text-white"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(teaching.duration)}
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">
                    {teaching.title}
                  </h3>
                  {teaching.speaker && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {teaching.speaker}
                    </p>
                  )}
                  {teaching.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {teaching.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {formatViews(teaching.views)}
                    </span>
                    <span>
                      {new Date(teaching.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
