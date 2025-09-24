import { useState, useEffect, useRef } from "react";

interface Highlight {
  type: 'image' | 'video';
  url: string;
  title: string;
  time: string;
}

interface TrainingHighlightsProps {
  trainerId: string | null;
}

export default function TrainingHighlights({ trainerId }: TrainingHighlightsProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mutedVideos, setMutedVideos] = useState<{[key: string]: boolean}>({});
  const videoRefs = useRef<{[key: string]: HTMLVideoElement}>({});

  // Load highlights data
  useEffect(() => {
    const loadHighlights = async () => {
      if (!trainerId) return;
      
      setIsLoading(true);
      const highlightData: Highlight[] = [];

      for (let i = 1; i <= 5; i++) {
        const jpgUrl = `https://presibo-wl.vercel.app/photos/${trainerId}/${i}.jpg`;
        const mp4Url = `https://presibo-wl.vercel.app/photos/${trainerId}/${i}.mp4`;

        let type: 'image' | 'video', url: string;

        try {
          const response = await fetch(jpgUrl, { method: 'HEAD' });
          if (response.ok) {
            type = 'image';
            url = jpgUrl;
          } else {
            throw new Error('Not a jpg');
          }
        } catch {
          try {
            const response = await fetch(mp4Url, { method: 'HEAD' });
            if (response.ok) {
              type = 'video';
              url = mp4Url;
            } else {
              continue; // Skip if neither exists
            }
          } catch {
            continue;
          }
        }

        highlightData.push({
          type,
          url,
          title: `Training Highlight ${i}`,
          time: `${i * 2} hours ago`,
        });
      }

      setHighlights(highlightData);
      setIsLoading(false);

      // Initialize all videos as muted
      const initialMutedState: {[key: string]: boolean} = {};
      highlightData.forEach((highlight, index) => {
        if (highlight.type === 'video') {
          initialMutedState[index] = true;
        }
      });
      setMutedVideos(initialMutedState);
    };

    loadHighlights();
  }, [trainerId]);

  const toggleMute = (index: number) => {
    setMutedVideos(prev => ({
      ...prev,
      [index]: !prev[index]
    }));

    const videoElement = videoRefs.current[index];
    if (videoElement) {
      videoElement.muted = !mutedVideos[index];
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <i className="fas fa-video-slash text-4xl mb-4 opacity-50"></i>
        <p>No training highlights available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {highlights.map((highlight, index) => (
        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 group">
          {highlight.type === 'image' ? (
            <>
              <img
                src={highlight.url}
                alt={highlight.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDg3LjUgODcuNUw3NSAxMDBMODcuNSAxMTIuNUwxMDAgMTAwWiIgZmlsbD0iIzlDOUM5OSIvPgo8dGV4dCB4PSIxMDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDOUM5OSIgZm9udC1zaXplPSIxMiI+VHJhaW5pbmc8L3RleHQ+Cjwvc3ZnPg==';
                }}
              />
              {/* Image indicator */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                <i className="fas fa-image text-white text-xs"></i>
              </div>
            </>
          ) : (
            <>
              <video
                ref={(el) => {
                  if (el) videoRefs.current[index] = el;
                }}
                src={highlight.url}
                className="w-full h-full object-cover"
                loop
                muted={mutedVideos[index]}
                onMouseEnter={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.play().catch(console.error);
                }}
                onMouseLeave={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.pause();
                  video.currentTime = 0;
                }}
                onError={(e) => {
                  console.error('Video failed to load:', highlight.url);
                }}
              />
              {/* Video controls */}
              <div className="absolute top-2 right-2 flex space-x-1">
                <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                  <i className="fas fa-play text-white text-xs"></i>
                </div>
                <button
                  onClick={() => toggleMute(index)}
                  className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <i className={`fas ${mutedVideos[index] ? 'fa-volume-mute' : 'fa-volume-up'} text-white text-xs`}></i>
                </button>
              </div>
            </>
          )}

          {/* Caption overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <h4 className="text-white text-sm font-medium">{highlight.title}</h4>
            <p className="text-white/80 text-xs">{highlight.time}</p>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className={`fas ${highlight.type === 'video' ? 'fa-play' : 'fa-search-plus'} text-white text-lg`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}