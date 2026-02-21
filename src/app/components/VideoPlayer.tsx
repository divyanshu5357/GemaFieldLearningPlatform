interface VideoPlayerProps {
  youtubeUrl: string;
  title: string;
}

export default function VideoPlayer({ youtubeUrl, title }: VideoPlayerProps) {
  // Extract YouTube video ID from various URL formats
  const extractVideoId = (url: string): string | null => {
    if (!url) {
      console.error("VideoPlayer: Empty URL received");
      return null;
    }

    console.log("VideoPlayer: Processing URL:", url);

    try {
      const cleanUrl = url.trim();

      // If already a video ID (11 chars, alphanumeric with - and _)
      if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
        console.log("VideoPlayer: Detected as video ID");
        return cleanUrl;
      }

      // Try URL parsing first
      try {
        const urlObj = new URL(cleanUrl);
        
        // youtube.com/watch?v=VIDEO_ID
        if (urlObj.hostname.includes("youtube.com")) {
          const videoId = urlObj.searchParams.get("v");
          if (videoId) {
            console.log("VideoPlayer: Extracted from youtube.com URL:", videoId);
            return videoId;
          }
        }
        
        // youtu.be/VIDEO_ID
        if (urlObj.hostname.includes("youtu.be")) {
          const videoId = urlObj.pathname.slice(1).split("?")[0];
          if (videoId) {
            console.log("VideoPlayer: Extracted from youtu.be URL:", videoId);
            return videoId;
          }
        }
      } catch (e) {
        console.log("VideoPlayer: URL parsing failed, trying regex patterns");
      }

      // Regex fallback patterns
      // Match youtube.com/watch?v=VIDEO_ID
      let match = cleanUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) {
        console.log("VideoPlayer: Extracted via regex:", match[1]);
        return match[1];
      }

      // Match just the video ID pattern anywhere in URL
      match = cleanUrl.match(/([a-zA-Z0-9_-]{11})/);
      if (match) {
        console.log("VideoPlayer: Found video ID pattern:", match[1]);
        return match[1];
      }

      console.error("VideoPlayer: Could not extract video ID from:", cleanUrl);
      return null;
    } catch (error) {
      console.error("VideoPlayer: Error extracting video ID:", error, "from URL:", url);
      return null;
    }
  };

  const videoId = extractVideoId(youtubeUrl);

  if (!videoId) {
    return (
      <div className="w-full aspect-video rounded-lg border-2 border-red-500/50 bg-red-500/10 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-red-300 font-bold text-lg mb-3">⚠️ Video Not Found</p>
          <p className="text-gray-300 text-sm mb-4">Unable to extract video ID from URL</p>
          <div className="bg-gray-900/50 rounded-lg p-4 text-left mb-4">
            <p className="text-gray-400 text-xs font-mono break-all">{youtubeUrl || "(empty)"}</p>
          </div>
          <p className="text-gray-400 text-xs mb-3">✓ Valid YouTube URL formats:</p>
          <ul className="text-gray-400 text-xs space-y-2">
            <li className="font-mono text-blue-300">youtube.com/watch?v=dQw4w9WgXcQ</li>
            <li className="font-mono text-blue-300">youtu.be/dQw4w9WgXcQ</li>
            <li className="font-mono text-blue-300">dQw4w9WgXcQ</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative w-full overflow-hidden rounded-xl border-2 border-blue-500/30 shadow-2xl bg-black hover:border-blue-500/50 transition-colors" style={{ aspectRatio: "16/9" }}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}
