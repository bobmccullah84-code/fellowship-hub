import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DualPaneViewer } from "@/components/dual-pane-viewer";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  X,
  SkipBack,
  SkipForward,
  Settings
} from "lucide-react";
import type { Teaching } from "@shared/schema";

interface VideoPlayerProps {
  teaching: Teaching;
  onClose: () => void;
  autoPlay?: boolean;
}

export default function VideoPlayer({ teaching, onClose, autoPlay = false }: VideoPlayerProps) {
  const contentType = teaching.contentType || "video";
  
  if (contentType === "mixed" || contentType === "document" || contentType === "youtube" || contentType === "audio") {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="overflow-hidden">
          <div className="relative bg-black">
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
              <div className="flex items-center justify-between text-white">
                <h3 className="font-semibold truncate">{teaching.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                  data-testid="button-close-player"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="aspect-video">
              <DualPaneViewer
                contentType={contentType}
                videoUrl={teaching.videoUrl}
                audioUrl={teaching.audioUrl}
                documentUrl={teaching.documentUrl}
                title={teaching.title}
              />
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">{teaching.title}</h2>
                <p className="text-muted-foreground">{teaching.speaker}</p>
              </div>
              
              {teaching.description && (
                <p className="text-card-foreground leading-relaxed">
                  {teaching.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {teaching.views && (
                  <span>{teaching.views.toLocaleString()} views</span>
                )}
                {teaching.createdAt && (
                  <span>{new Date(teaching.createdAt).toLocaleDateString()}</span>
                )}
                {teaching.duration && (
                  <span>{Math.floor(teaching.duration / 60)} minutes</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = async () => {
      setDuration(video.duration);
      setIsLoading(false);
      
      // Auto-play if requested
      if (autoPlay && video) {
        try {
          await video.play();
          setIsPlaying(true);
          // Set localStorage flag for welcome video tracking
          if (teaching.title === "Welcome to Fellowship Hub") {
            localStorage.setItem('FH_WELCOME_VIEWED', 'true');
          }
        } catch (error) {
          console.log('Autoplay blocked by browser:', error);
          // Autoplay failed, user will need to manually start
        }
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const toggleFullscreen = async () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    try {
      if (isFullscreen) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="overflow-hidden">
        <div className="relative bg-black group" onMouseMove={handleMouseMove}>
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full aspect-video"
            poster={teaching.thumbnailUrl || undefined}
            data-testid="video-player"
            autoPlay={autoPlay}
            muted={autoPlay} // Start muted for better autoplay support
          >
            {teaching.videoUrl && (
              <source src={teaching.videoUrl} type="video/mp4" />
            )}
            Your browser does not support the video tag.
          </video>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {/* Controls Overlay */}
          <div 
            className={`absolute inset-0 transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <h3 className="font-semibold truncate">{teaching.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                  data-testid="button-close-player"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Center Play Button */}
            {!isPlaying && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={togglePlay}
                  className="bg-primary/90 hover:bg-primary rounded-full p-6"
                  data-testid="button-center-play"
                >
                  <Play className="h-8 w-8 ml-1" />
                </Button>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <Slider
                  value={[progress]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                  data-testid="slider-progress"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                    data-testid="button-play-pause"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skip(-10)}
                    className="text-white hover:bg-white/20"
                    data-testid="button-skip-back"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skip(10)}
                    className="text-white hover:bg-white/20"
                    data-testid="button-skip-forward"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                      data-testid="button-mute"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        data-testid="slider-volume"
                      />
                    </div>
                  </div>

                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    data-testid="button-settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                    data-testid="button-fullscreen"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Information */}
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">{teaching.title}</h2>
              <p className="text-muted-foreground">{teaching.speaker}</p>
            </div>
            
            {teaching.description && (
              <p className="text-card-foreground leading-relaxed">
                {teaching.description}
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {teaching.views && (
                <span>{teaching.views.toLocaleString()} views</span>
              )}
              {teaching.createdAt && (
                <span>{new Date(teaching.createdAt).toLocaleDateString()}</span>
              )}
              {teaching.duration && (
                <span>{Math.floor(teaching.duration / 60)} minutes</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
