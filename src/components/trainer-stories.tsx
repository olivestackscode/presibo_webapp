import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface Story {
  type: 'image' | 'video';
  url: string;
  title: string;
  time: string;
  viewed: boolean;
}

interface TrainerStoriesProps {
  trainerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrainerStories({ trainerId, isOpen, onClose }: TrainerStoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout>();

  // Load stories data
  useEffect(() => {
    const loadStories = async () => {
      setIsLoading(true);
      const statusData: Story[] = [];

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

        statusData.push({
          type,
          url,
          title: `Training Highlight ${i}`,
          time: `${i * 2} hours ago`,
          viewed: false
        });
      }

      setStories(statusData);
      setIsLoading(false);
    };

    if (isOpen && trainerId) {
      loadStories();
    }
  }, [isOpen, trainerId]);

  // Progress bar logic
  useEffect(() => {
    if (!isOpen || isPaused || stories.length === 0) return;

    const duration = stories[currentIndex]?.type === 'video' ? 10000 : 5000; // 10s for video, 5s for image
    const interval = 50;
    const increment = (interval / duration) * 100;

    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, isOpen, isPaused, stories.length]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
    const touchX = touch.clientX;

    if (touchX < screenWidth / 2) {
      prevStory();
    } else {
      nextStory();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;

    if (clickX < screenWidth / 2) {
      prevStory();
    } else {
      nextStory();
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-[70] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-[70] flex items-center justify-center">
        <div className="text-center text-white">
          <i className="fas fa-camera text-4xl mb-4 opacity-50"></i>
          <p className="text-lg">No training highlights available</p>
          <Button 
            onClick={onClose}
            className="mt-4 bg-white/20 hover:bg-white/30 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-[70]">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
      >
        <i className="fas fa-times"></i>
      </button>

      {/* Story content */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      >
        {currentStory.type === 'image' ? (
          <img
            src={currentStory.url}
            alt={currentStory.title}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVMMTUwIDE1MEwxNzUgMTc1TDIwMCAxNTBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUM5Qzk5IiBmb250LXNpemU9IjE0Ij5UcmFpbmluZyBIaWdobGlnaHQ8L3RleHQ+Cjwvc3ZnPg==';
            }}
          />
        ) : (
          <video
            ref={videoRef}
            src={currentStory.url}
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted={isMuted}
            onError={(e) => {
              console.error('Video failed to load:', currentStory.url);
            }}
            onLoadedData={() => {
              if (videoRef.current) {
                videoRef.current.muted = isMuted;
                videoRef.current.play().catch(console.error);
              }
            }}
          />
        )}

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
              <i className="fas fa-pause text-white text-xl"></i>
            </div>
          </div>
        )}
      </div>

      {/* Story info */}
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h3 className="text-lg font-semibold">{currentStory.title}</h3>
        <p className="text-sm opacity-80">{currentStory.time}</p>
      </div>

      {/* Touch areas for navigation (invisible) */}
      <div className="absolute inset-0 flex">
        <div className="flex-1" /> {/* Left half for previous */}
        <div className="flex-1" /> {/* Right half for next */}
      </div>

      {/* Control buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col space-y-3">
        <button
          onClick={togglePause}
          className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
        >
          <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
        </button>
        
        {/* Unmute button - only show for videos */}
        {currentStory.type === 'video' && (
          <button
            onClick={toggleMute}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
          >
            <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
          </button>
        )}
      </div>
    </div>
  );
}