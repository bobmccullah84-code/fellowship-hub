import { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import DOMPurify from "dompurify";

interface DualPaneViewerProps {
  contentType?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  documentUrl?: string | null;
  content?: string | null;
  title?: string;
}

export function DualPaneViewer({
  contentType = "video",
  videoUrl,
  audioUrl,
  documentUrl,
  content,
  title,
}: DualPaneViewerProps) {
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
  const [youtubeId, setYoutubeId] = useState<string | null>(null);

  useEffect(() => {
    if (videoUrl && contentType === "youtube") {
      const extractedId = extractYouTubeId(videoUrl);
      setYoutubeId(extractedId);
    }
  }, [videoUrl, contentType]);

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const renderMedia = () => {
    if (contentType === "youtube" && youtubeId) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || "YouTube Video"}
            data-testid="youtube-embed"
          />
        </div>
      );
    }

    if ((contentType === "video" || contentType === "mixed") && videoUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <video
            controls
            className="w-full h-full"
            src={videoUrl}
            data-testid="video-player"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if ((contentType === "audio" || contentType === "mixed") && audioUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted p-8">
          <div className="w-full max-w-2xl">
            <audio controls className="w-full" src={audioUrl} data-testid="audio-player">
              Your browser does not support the audio tag.
            </audio>
          </div>
        </div>
      );
    }

    if (contentType === "mixed") {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted p-8">
          <p className="text-muted-foreground">No media URL provided. Please configure video or audio content.</p>
        </div>
      );
    }

    return null;
  };

  const renderDocument = () => {
    if (!documentUrl) return null;

    const fileExtension = documentUrl.split('.').pop()?.toLowerCase();

    if (fileExtension === "pdf") {
      return (
        <div className="w-full h-full flex flex-col bg-muted">
          <div className="p-6 bg-card border-b">
            <h3 className="text-lg font-semibold mb-2">PDF Document</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Some browsers may block PDFs from displaying inline. Click the button below to view the document.
            </p>
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              data-testid="button-open-pdf"
            >
              Open PDF in New Tab
            </a>
          </div>
          <div className="flex-1 relative">
            <object
              data={documentUrl}
              type="application/pdf"
              className="w-full h-full"
              data-testid="pdf-viewer"
            >
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <p className="text-muted-foreground mb-4">
                    Your browser doesn't support inline PDF viewing.
                  </p>
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    data-testid="button-open-pdf-fallback"
                  >
                    Click here to view the PDF
                  </a>
                </div>
              </div>
            </object>
          </div>
        </div>
      );
    }

    if (fileExtension === "txt") {
      return (
        <div className="w-full h-full overflow-auto p-6 bg-background">
          <iframe
            src={documentUrl}
            className="w-full h-full border-0"
            title="Text Document"
            data-testid="text-viewer"
          />
        </div>
      );
    }

    return (
      <div className="w-full h-full overflow-auto p-6 bg-muted">
        <div className="max-w-4xl mx-auto bg-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Document</h3>
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
            data-testid="document-link"
          >
            Open Document in New Tab
          </a>
          <p className="text-sm text-muted-foreground mt-2">
            This document type cannot be displayed inline. Click the link above to view it.
          </p>
        </div>
      </div>
    );
  };

  if (contentType === "mixed") {
    const hasMedia = !!(videoUrl || audioUrl);
    const hasDocument = !!documentUrl;
    
    if (!hasMedia && !hasDocument) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted p-8">
          <p className="text-muted-foreground">No content available. Please configure media and/or document URLs.</p>
        </div>
      );
    }
    
    if (hasMedia && hasDocument) {
      return (
        <div className="w-full h-full" data-testid="dual-pane-viewer">
          <div className="flex justify-end p-2 bg-muted/20">
            <button
              onClick={() => setLayout(layout === "horizontal" ? "vertical" : "horizontal")}
              className="px-3 py-1 text-sm bg-background hover:bg-muted rounded border"
              data-testid="toggle-layout-button"
            >
              {layout === "horizontal" ? "Switch to Vertical" : "Switch to Horizontal"}
            </button>
          </div>
          <ResizablePanelGroup
            direction={layout}
            className="h-full"
          >
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full overflow-auto">
                {renderMedia()}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full overflow-auto">
                {renderDocument()}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      );
    }
    
    if (hasMedia) {
      return (
        <div className="w-full h-full" data-testid="media-viewer">
          {renderMedia()}
        </div>
      );
    }
    
    if (hasDocument) {
      return (
        <div className="w-full h-full flex flex-col">
          <div className="p-4 bg-muted/50 border-b">
            <p className="text-sm text-muted-foreground">
              Note: This lesson is configured as mixed content but no media URL is provided.
            </p>
          </div>
          <div className="flex-1 overflow-auto" data-testid="document-viewer">
            {renderDocument()}
          </div>
        </div>
      );
    }
  }

  if (contentType === "document" && documentUrl) {
    return (
      <div className="w-full h-full" data-testid="document-viewer">
        {renderDocument()}
      </div>
    );
  }

  if ((contentType === "video" || contentType === "youtube" || contentType === "audio") && (videoUrl || audioUrl)) {
    return (
      <div className="w-full h-full" data-testid="media-viewer">
        {renderMedia()}
      </div>
    );
  }

  if (contentType === "text" && content) {
    const sanitizedContent = DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
      ALLOW_DATA_ATTR: false,
    });
    return (
      <div className="w-full h-full overflow-auto bg-background" data-testid="text-content-viewer">
        <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-12">
          <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-muted p-8">
      <p className="text-muted-foreground">No content available</p>
    </div>
  );
}
