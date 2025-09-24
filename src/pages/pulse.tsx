import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface PulsePost {
  id: number;
  type: 'video' | 'image';
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  hashtags: string[];
  time: string;
  likes: number;
  comments: number;
  shares: number;
  trainer: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}



export default function Pulse() {
  const [, setLocation] = useLocation();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imageSlideIndex, setImageSlideIndex] = useState(0);

  // Fetch pulse posts from API
  const { data: pulsePosts, isLoading, error } = useQuery<{ posts: PulsePost[] }>({
    queryKey: ['/api/pulse'],
    queryFn: async () => {
      try {
        const response = await fetch('https://presibo-wl.vercel.app/pulse.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Pulse data loaded:', data);
        return data;
      } catch (err) {
        console.error('Error loading pulse data:', err);
        // Return sample data as fallback
        return {
          posts: [
            {
              id: 1,
              type: 'video',
              url: 'https://presibo-wl.vercel.app/photos/100/4.mp4',
              thumbnail: 'https://presibo-wl.vercel.app/photos/100/2.jpg',
              title: 'Perfect Push-Up Form',
              description: 'Master the perfect push-up with these key technique tips! 💪',
              hashtags: ['#PushUpForm', '#FitnessForm', '#StrengthTraining'],
              time: '2 hours ago',
              likes: 1247,
              comments: 89,
              shares: 34,
              trainer: {
                id: "100",
                name: 'Precious Edwin',
                username: '@PreciousEdwin',
                avatar: 'https://presibo-wl.vercel.app/photos/100/avatar.jpg'
              }
            }
          ]
        };
      }
    },
  });

  // Custom algorithm: 100,99,98 → 50,49,48 → 97,96,95 → 47,46,45,44,43,42,41,40 → 94 to 60 → 39 to 20 to 1 → back to 50 to 59
  const rearrangePosts = (originalPosts: PulsePost[]) => {
    if (!originalPosts.length) return [];
    
    const total = originalPosts.length;
    const arranged: number[] = []; // Store indices to track order
    const used = new Set<number>();
    
    // Sort posts by ID descending (newest first)
    const sortedPosts = [...originalPosts].sort((a, b) => b.id - a.id);
    
    // Helper to add sequential items
    const addSequential = (start: number, count: number, descending = true) => {
      for (let i = 0; i < count && arranged.length < total; i++) {
        const index = descending ? start + i : start - i;
        if (index >= 0 && index < total && !used.has(index)) {
          arranged.push(index);
          used.add(index);
        }
      }
    };
    
    // Pattern: For 100 items → 100,99,98 (newest 3)
    addSequential(0, 3);
    
    // Skip to middle → 50,49,48 (middle 3)
    const middlePoint = Math.floor(total / 2);
    addSequential(middlePoint, 3);
    
    // Back to newest → 97,96,95 (continue from where we left off)
    addSequential(3, 3);
    
    // Continue from middle → 47,46,45,44,43,42,41,40 (8 items)
    addSequential(middlePoint + 3, 8);
    
    // More newest → 94 to 60 (remaining newest section)
    addSequential(6, Math.min(35, total - 6));
    
    // Older content → 39 to 20 then to 1
    addSequential(middlePoint + 11, total - (middlePoint + 11));
    
    // Fill any gaps in newest section → back to 50-59 range
    for (let i = middlePoint - 10; i < middlePoint && arranged.length < total; i++) {
      if (i >= 0 && !used.has(i)) {
        arranged.push(i);
        used.add(i);
      }
    }
    
    // Final cleanup - add any remaining items
    for (let i = 0; i < total && arranged.length < total; i++) {
      if (!used.has(i)) {
        arranged.push(i);
        used.add(i);
      }
    }
    
    // Convert indices back to posts
    return arranged.map(index => sortedPosts[index]);
  };

  const arrangedPosts = rearrangePosts(pulsePosts?.posts || []);
  
  // Create endless scroll by repeating the arranged posts
  const posts = arrangedPosts.length > 0 ? 
    Array.from({ length: arrangedPosts.length * 10 }, (_, i) => arrangedPosts[i % arrangedPosts.length]) : 
    [];
  
  const currentPost = posts[currentVideoIndex];

  useEffect(() => {
    // Initialize liked videos - for demo purposes, we'll start with empty set
    setLikedVideos(new Set());
  }, []);

  // Handle video play/pause when switching content
  useEffect(() => {
    // Pause all videos first
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentVideoIndex) {
        video.pause();
      }
    });

    // Play current video if it exists and is a video
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo && currentPost?.type === 'video') {
      // Remove muted attribute to enable audio
      currentVideo.muted = false;
      currentVideo.play().catch(error => {
        // If autoplay fails, fallback to muted autoplay
        console.log('Autoplay failed, trying muted:', error);
        currentVideo.muted = true;
        currentVideo.play().catch(console.error);
      });
    }
  }, [currentVideoIndex, currentPost]);

  // Auto-advance slideshow for images (endless scroll)
  useEffect(() => {
    if (currentPost?.type === 'image') {
      const interval = setInterval(() => {
        setCurrentVideoIndex(prev => (prev + 1) % posts.length);
      }, 5000); // Auto-advance every 5 seconds for images

      return () => clearInterval(interval);
    }
  }, [currentPost, currentVideoIndex, posts.length]);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 30;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe) {
      // Swipe up - next video (endless scroll)
      setCurrentVideoIndex(prev => (prev + 1) % posts.length);
    }
    if (isDownSwipe) {
      // Swipe down - previous video (endless scroll)
      setCurrentVideoIndex(prev => prev > 0 ? prev - 1 : posts.length - 1);
    }
  };

  // Handle wheel events for desktop scrolling (endless scroll)
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const threshold = 10; // Minimum wheel delta to trigger scroll
    
    if (Math.abs(e.deltaY) > threshold) {
      const isScrollUp = e.deltaY < 0;
      const isScrollDown = e.deltaY > 0;

      if (isScrollDown) {
        // Scroll down - next video (endless scroll)
        setCurrentVideoIndex(prev => (prev + 1) % posts.length);
      }
      if (isScrollUp) {
        // Scroll up - previous video (endless scroll)
        setCurrentVideoIndex(prev => prev > 0 ? prev - 1 : posts.length - 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading Pulse...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>Error loading content</p>
          <p className="text-sm text-gray-400 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!posts.length || !currentPost) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>No content available</p>
          <p className="text-sm text-gray-400 mt-2">Posts: {posts.length}, Current: {currentPost ? 'exists' : 'null'}</p>
        </div>
      </div>
    );
  }



  const handleLike = (videoId: number) => {
    setLikedVideos(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(videoId)) {
        newLiked.delete(videoId);
      } else {
        newLiked.add(videoId);
      }
      return newLiked;
    });
  };

  const handleShare = (post: PulsePost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: `${window.location.origin}/pulse?v=${post.id}`
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${window.location.origin}/pulse?v=${post.id}`);
      alert('Link copied to clipboard!');
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="text-white hover:bg-white/20"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </Button>
          <h1 className="text-white font-bold text-xl">Presibo Pulse</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <i className="fas fa-search"></i>
          </Button>
        </div>
      </div>

      {/* Video Container */}
      <div 
        ref={containerRef}
        className="relative h-full w-full flex flex-col"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
      >
        {/* Current Content */}
        <div className="relative h-full w-full">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${currentPost.thumbnail || currentPost.url})`,
              filter: 'blur(20px)',
              transform: 'scale(1.1)'
            }}
          />
          
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Content Display */}
          <div className="relative h-full w-full flex items-center justify-center">
            {currentPost.type === 'video' ? (
              <video 
                ref={(el) => {
                  if (el) {
                    videoRefs.current[currentVideoIndex] = el;
                  }
                }}
                src={currentPost.url}
                poster={currentPost.thumbnail}
                className="max-h-full max-w-full object-contain rounded-lg"
                controls
                loop
                autoPlay
                playsInline
                preload="metadata"
                onLoadedMetadata={() => {
                  const video = videoRefs.current[currentVideoIndex];
                  if (video) {
                    video.play().catch(console.error);
                  }
                }}
              />
            ) : (
              <img 
                src={currentPost.url}
                alt={currentPost.title}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Content Info Overlay */}
        <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="mb-2">
            <Badge className="bg-naija-green text-white">
              {currentPost.type.toUpperCase()}
            </Badge>
          </div>
          
          <h2 className="text-white font-bold text-lg mb-2">
            {currentPost.title}
          </h2>
          
          <p className="text-white/90 text-sm mb-3 line-clamp-3">
            {currentPost.description}
          </p>
          
          <div className="flex items-center mb-2">
            <button 
              onClick={() => setLocation(`/trainer/profile?id=${currentPost.trainer.id}`)}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src={currentPost.trainer.avatar}
                alt={currentPost.trainer.name}
                className="w-8 h-8 rounded-full mr-3"
              />
              <span className="text-white font-medium">{currentPost.trainer.name}</span>
            </button>
            <span className="text-white/70 text-sm ml-2">• {currentPost.time}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentPost.hashtags.map((tag: string, index: number) => (
              <span key={index} className="text-naija-green text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Side Actions */}
        <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6">
          {/* Mute/Unmute Button - Only for videos */}
          {currentPost.type === 'video' && (
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  const video = videoRefs.current[currentVideoIndex];
                  if (video) {
                    video.muted = !video.muted;
                    // Force re-render by updating a state
                    setCurrentVideoIndex(prev => prev);
                  }
                }}
                className="text-white hover:bg-white/20 rounded-full w-12 h-12"
              >
                <i className={`fas ${videoRefs.current[currentVideoIndex]?.muted ? 'fa-volume-mute' : 'fa-volume-up'} text-xl`}></i>
              </Button>
            </div>
          )}
          
          {/* Like Button */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => handleLike(currentPost.id)}
              className={`rounded-full w-12 h-12 ${
                likedVideos.has(currentPost.id) 
                  ? 'text-red-500' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <i className={`fas fa-heart text-xl ${
                likedVideos.has(currentPost.id) ? 'text-red-500' : ''
              }`}></i>
            </Button>
            <span className="text-white text-xs mt-1">
              {formatNumber(currentPost.likes + (likedVideos.has(currentPost.id) ? 1 : 0))}
            </span>
          </div>

          {/* Comment Button */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20 rounded-full w-12 h-12"
            >
              <i className="fas fa-comment text-xl"></i>
            </Button>
            <span className="text-white text-xs mt-1">
              {formatNumber(currentPost.comments)}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => handleShare(currentPost)}
              className="text-white hover:bg-white/20 rounded-full w-12 h-12"
            >
              <i className="fas fa-share text-xl"></i>
            </Button>
            <span className="text-white text-xs mt-1">
              {formatNumber(currentPost.shares)}
            </span>
          </div>
        </div>


      </div>


    </div>
  );
}